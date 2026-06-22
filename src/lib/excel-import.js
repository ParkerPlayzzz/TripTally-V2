import ExcelJS from "exceljs";
import { format } from "date-fns";

function normalizeHeader(header) {
  return String(header || "").trim().toLowerCase().replace(/[_\s]+/g, " ");
}

function normalizeRow(row) {
  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});
}

function normalizeCell(value) {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && value.text) return value.text;
  if (value && typeof value === "object" && value.richText) return value.richText.map((part) => part.text).join("");
  return String(value || "").trim();
}

function extractTimeFromText(text) {
  const normalized = String(text || "");
  const match = normalized.match(/\b(?:([01]?\d|2[0-3]):([0-5]\d)(?:\s*(am|pm))?|([01]?\d|2[0-3])\s*(am|pm))\b/i);
  if (!match) return { time: null, text: normalized };

  const timeText = match[0];
  const parsed = parseTimeValue(timeText);
  if (!parsed) return { time: null, text: normalized };

  let cleaned = normalized.replace(match[0], "");
  cleaned = cleaned.replace(/\b(at|around|by|@)\b/gi, "").replace(/\s{2,}/g, " ").trim();
  return { time: parsed, text: cleaned || normalized };
}

function getRowValue(row, keys) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (Object.prototype.hasOwnProperty.call(row, normalized) && row[normalized] !== undefined && row[normalized] !== null) {
      const value = normalizeCell(row[normalized]);
      if (value !== "") return value;
    }
  }
  return undefined;
}

function parseDateValue(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return format(value, "yyyy-MM-dd");
  }
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + (value - 1) * 86400000);
    if (!Number.isNaN(date.getTime())) return format(date, "yyyy-MM-dd");
  }
  const text = String(value).trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return format(parsed, "yyyy-MM-dd");
  }
  const altMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (altMatch) {
    const [_, m, d, y] = altMatch;
    const year = Number(y.length === 2 ? `20${y}` : y);
    const parsedAlt = new Date(year, Number(m) - 1, Number(d));
    if (!Number.isNaN(parsedAlt.getTime())) return format(parsedAlt, "yyyy-MM-dd");
  }
  return null;
}

function parseTimeValue(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return format(value, "HH:mm");
  }
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + (value - 1) * 86400000);
    if (!Number.isNaN(date.getTime())) return format(date, "HH:mm");
  }
  const text = String(value).trim();
  if (!text) return null;
  const parsed = new Date(`1970-01-01T${text}`);
  if (!Number.isNaN(parsed.getTime())) return format(parsed, "HH:mm");
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2] || "0");
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }
  return null;
}

const titleKeys = ["title", "activity", "event", "task", "name", "subject", "event name", "activity name"];
const dateKeys = ["date", "event date", "day", "start date", "start_date", "trip date", "day/date", "scheduled date", "day of week", "date/time", "datetime"];
const typeKeys = ["type", "activity type", "event type", "category", "task type", "kind"];
const locationKeys = ["location", "place", "venue", "where", "address"];
const notesKeys = ["notes", "note", "description", "details", "memo", "remarks"];
const startTimeKeys = ["start time", "start_time", "begin", "time", "start", "starttime", "from"];
const endTimeKeys = ["end time", "end_time", "finish", "end", "endtime", "to"];
const priceKeys = ["price", "cost", "amount", "rate", "total"];
const reservationKeys = ["reservation", "reservation number", "reservation #", "booking ref", "booking reference"];
const hotelNameKeywords = ["hotel", "inn", "resort", "hostel", "lodge"];

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const SECTION_TITLES = [/^hotel$/i, /^address$/i, /^phone/i, /^reservation/i, /^booking/i];

function getActivityTime(row, textFields) {
  const dedicated = getRowValue(row, startTimeKeys);
  if (dedicated) {
    const parsed = parseTimeValue(dedicated);
    if (parsed) return parsed;
  }

  for (const key of textFields) {
    const value = getRowValue(row, [key]);
    if (value) {
      const { time } = extractTimeFromText(value);
      if (time) return time;
    }
  }
  return null;
}

function buildDatetime(date, time) {
  if (!date || !time) return undefined;
  return `${date}T${time}:00`;
}

function parseMonthYearFromText(text) {
  const input = String(text || "");
  const yearMatch = input.match(/(20\d{2})/);
  const monthMatch = input.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i);
  if (yearMatch && monthMatch) {
    const months = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    return {
      year: Number(yearMatch[1]),
      month: months[monthMatch[0].slice(0, 3).toLowerCase()],
    };
  }
  const numericMatch = input.match(/(20\d{2})[^\d]*(0?[1-9]|1[0-2])[^\d]*/);
  if (numericMatch) {
    return {
      year: Number(numericMatch[1]),
      month: Number(numericMatch[2]),
    };
  }
  return null;
}

function sanitizeDateHeaderText(value) {
  const text = String(value || "").trim();
  return text.replace(/(\d+)(st|nd|rd|th)\b/i, "$1");
}

function parseDateHeaderValue(raw, fileInfo) {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === "number") {
    return new Date(fileInfo.year, fileInfo.month - 1, raw);
  }

  const text = sanitizeDateHeaderText(raw);
  if (!text) return null;

  const hasYear = /\b20\d{2}\b/.test(text);
  const candidateText = hasYear ? text : `${text} ${fileInfo.year}`;
  const parsed = new Date(candidateText);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const dayOnly = text.match(/^(\d{1,2})$/);
  if (dayOnly) {
    return new Date(fileInfo.year, fileInfo.month - 1, Number(dayOnly[1]));
  }

  return null;
}

function isCalendarGrid(rows) {
  if (rows.length < 3) return false;
  const dayRow = rows[1] || [];
  const dateRow = rows[2] || [];
  const dayNameCount = dayRow.reduce((count, cell) => {
    return count + (DAY_NAMES.includes(String(cell || "").trim().toLowerCase()) ? 1 : 0);
  }, 0);
  const dateCount = dateRow.reduce((count, cell) => {
    return count + (typeof cell === "number" && cell >= 1 && cell <= 31 ? 1 : 0);
  }, 0);
  return dayNameCount >= 3 && dateCount >= 3;
}

function getDateHeaderConfig(firstRow, fileInfo) {
  const values = Array.isArray(firstRow) ? firstRow : [];
  const parsed = values.map((cell) => parseDateHeaderValue(cell, fileInfo));

  const allDates = parsed.filter((date) => date);
  if (allDates.length >= 2) {
    return { dates: parsed, offset: 0 };
  }

  const shifted = values.slice(1).map((cell) => parseDateHeaderValue(cell, fileInfo));
  const shiftedDates = shifted.filter((date) => date);
  if (shiftedDates.length >= 2) {
    return { dates: [null, ...shifted], offset: 1 };
  }

  return { dates: [], offset: 0 };
}

function isDateHeaderGrid(rows, fileInfo) {
  if (rows.length < 2) return false;
  const firstRow = rows[0] || [];
  const config = getDateHeaderConfig(firstRow, fileInfo);
  return config.dates.filter((date) => date).length >= 2;
}

function buildCalendarDates(dateRow, baseYear, baseMonth) {
  const dates = [];
  let currentMonth = baseMonth;
  let currentYear = baseYear;
  let previousDay = null;

  for (let i = 1; i < dateRow.length; i += 1) {
    const raw = dateRow[i];
    const day = typeof raw === "number" ? raw : parseInt(String(raw || "").trim(), 10);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      dates.push(null);
      continue;
    }
    if (previousDay != null && day < previousDay) {
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
    }
    previousDay = day;
    dates.push(new Date(currentYear, currentMonth - 1, day));
  }
  return dates;
}

function shouldStopCalendarRow(row) {
  if (!Array.isArray(row) || row.length === 0) return true;
  const firstCell = String(row[0] || "").trim();
  return SECTION_TITLES.some((regex) => regex.test(firstCell));
}

function normalizeHotelKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s\u00A0]+/g, " ");
}

const KNOWN_COUNTRIES = [
  "united states", "usa", "us", "canada", "united kingdom", "uk", "england", "scotland", "wales", "northern ireland", "germany", "france", "spain", "italy", "australia", "japan", "china", "india", "mexico", "brazil", "netherlands", "switzerland", "sweden", "norway", "denmark", "finland", "new zealand", "singapore", "ireland", "belgium", "austria", "portugal", "greece", "argentina", "turkey", "thailand", "malaysia", "south korea", "south africa", "uae", "dubai"
];

const STATE_CODES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT",
  "NSW","QLD","VIC","TAS","SA","WA","ACT","NT",
]);

function normalizeLocationPart(value) {
  return String(value || "").trim().replace(/^\s+|\s+$/g, "");
}

function isCountryName(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  if (KNOWN_COUNTRIES.includes(normalized)) return true;
  if (/^[A-Z]{2}$/.test(value.trim())) return true;
  return false;
}

function isStateOrProvince(value) {
  if (!value) return false;
  const normalized = String(value).trim().toUpperCase();
  return STATE_CODES.has(normalized);
}

function isPostalCode(value) {
  if (!value) return false;
  const normalized = String(value).trim();
  return (
    /^[0-9]{3,}$/.test(normalized) ||
    /^[0-9]{3}-[0-9]{4}$/.test(normalized) ||
    /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(normalized) ||
    /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(normalized)
  );
}

function looksLikeCityPart(value) {
  if (!value) return false;
  const normalized = String(value).trim();
  if (!/[A-Za-z\u00C0-\u017F]/.test(normalized)) return false;
  if (/[0-9]/.test(normalized)) return false;
  if (isStateOrProvince(normalized)) return false;
  if (isCountryName(normalized)) return false;
  if (isPostalCode(normalized)) return false;
  return true;
}

function parseCityCountryFromAddress(address) {
  if (!address) return {};
  const raw = String(address).trim();
  if (!raw) return {};
  const parts = raw.split(/[,;\/\\|]+/).map(normalizeLocationPart).filter(Boolean);
  if (parts.length === 0) return {};

  let city;
  let country;

  const lastPart = parts[parts.length - 1];
  if (isCountryName(lastPart)) {
    country = lastPart;
    parts.pop();
  }

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const candidate = parts[index];
    if (looksLikeCityPart(candidate)) {
      city = candidate;
      break;
    }
  }

  if (!city) {
    for (let index = 0; index < parts.length; index += 1) {
      const candidate = parts[index];
      if (looksLikeCityPart(candidate)) {
        city = candidate;
        break;
      }
    }
  }

  if (!city && parts.length > 0) {
    const fallback = parts[parts.length - 1];
    if (!/^[0-9]/.test(fallback) && !isPostalCode(fallback) && !isStateOrProvince(fallback)) {
      city = fallback;
    }
  }

  return {
    city: city || undefined,
    country: country || undefined,
  };
}

function parseBookingPlatform(value) {
  if (!value && value !== 0) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  const platform = text.match(/(agoda|expedia|booking\.com|booking|hotels\.com|hotels|vrbo|airbnb|trips\.com)/i);
  return platform ? platform[0].replace(/booking\.com/i, "Booking.Com").replace(/hotels\.com/i, "Hotels.com") : undefined;
}

function parsePriceValue(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return value;
  const text = String(value).replace(/[^0-9.\-]/g, "").trim();
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isHotelRowHeader(value) {
  const input = String(value || "").trim().toLowerCase();
  return /^(hotel|hotel name|inn|resort|hostel|lodge|address|booking tool|booking platform|reservation|price|phone)/i.test(input);
}

function rowLooksLikeHotel(row) {
  const values = Object.values(row).map((value) => String(value || "").toLowerCase());
  return values.some((value) => hotelNameKeywords.some((keyword) => value.includes(keyword)));
}

function parseHotelsFromDateHeaderGrid(rows, config) {
  const hotelRows = {
    hotel: null,
    address: null,
    booking: null,
    price: null,
    reservation: null,
  };

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const firstCell = normalizeCell(row[0]);
    if (!firstCell) continue;
    const label = normalizeHeader(firstCell);
    if (/^hotel/.test(label)) {
      hotelRows.hotel = row;
      continue;
    }
    if (/address/.test(label)) {
      hotelRows.address = row;
      continue;
    }
    if (/booking/.test(label)) {
      hotelRows.booking = row;
      continue;
    }
    if (/price/.test(label)) {
      hotelRows.price = row;
      continue;
    }
    if (/reservation/.test(label)) {
      hotelRows.reservation = row;
      continue;
    }
    if (/^(inn|resort|hostel|lodge)$/.test(label)) {
      hotelRows.hotel = row;
      continue;
    }
  }

  const hotelsByName = new Map();

  const hotelValueStart = config.offset + (isHotelRowHeader(normalizeCell(hotelRows.hotel?.[config.offset])) ? 1 : 0);
  for (let colIndex = hotelValueStart; colIndex < config.dates.length; colIndex += 1) {
    const date = config.dates[colIndex];
    if (!date) continue;
    const rawName = normalizeCell(hotelRows.hotel?.[colIndex]);
    if (!rawName) continue;

    const name = String(rawName).trim();
    const key = normalizeHotelKey(name);
    const checkInDate = format(date, "yyyy-MM-dd");
    const address = normalizeCell(hotelRows.address?.[colIndex]);
    const { city, country } = parseCityCountryFromAddress(address);
    const bookingPlatform = parseBookingPlatform(hotelRows.booking?.[colIndex]);
    const price = parsePriceValue(hotelRows.price?.[colIndex]);
    const reservation_number = normalizeCell(hotelRows.reservation?.[colIndex]);

    const existing = hotelsByName.get(key);
    if (existing) {
      const existingCheckIn = existing.check_in;
      const existingCheckOut = existing.check_out;
      if (checkInDate < existingCheckIn) existing.check_in = checkInDate;
      if (checkInDate > existingCheckOut) existing.check_out = checkInDate;
      if (!existing.address && address) existing.address = address;
      if (!existing.city && city) existing.city = city;
      if (!existing.country && country) existing.country = country;
      if (!existing.platform && bookingPlatform) existing.platform = bookingPlatform;
      if (!existing.bookingPlatform && bookingPlatform) existing.bookingPlatform = bookingPlatform;
      if (!existing.price && price !== undefined) existing.price = price;
      if (!existing.reservation_number && reservation_number) existing.reservation_number = reservation_number;
    } else {
      hotelsByName.set(key, {
        name,
        check_in: checkInDate,
        check_out: checkInDate,
        checkInDate: checkInDate,
        checkOutDate: checkInDate,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        platform: bookingPlatform,
        bookingPlatform: bookingPlatform,
        price: price !== undefined ? price : undefined,
        reservation_number: reservation_number || undefined,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return Array.from(hotelsByName.values()).map((hotel) => ({
    ...hotel,
    checkOutDate: hotel.check_out,
  }));
}

function parseDateHeaderGrid(rows, fileInfo) {
  const headerText = rows[0]?.[0] ? String(rows[0][0]) : "";
  const resolvedFileInfo = fileInfo || parseMonthYearFromText(headerText) || {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };
  const config = getDateHeaderConfig(rows[0], resolvedFileInfo);
  const activities = [];
  const hotels = parseHotelsFromDateHeaderGrid(rows, config);

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row || row.every((cell) => cell === null || cell === undefined || String(cell).trim() === "")) continue;
    const firstCell = String(row[0] || "").trim();
    if (isHotelRowHeader(firstCell)) continue;

    for (let colIndex = config.offset; colIndex < row.length; colIndex += 1) {
      const rawCell = row[colIndex];
      const cell = normalizeCell(rawCell);
      const date = config.dates[colIndex];
      if (!cell || !date) continue;
      const { time, text: cleanedTitle } = extractTimeFromText(cell);
      const formattedDate = format(date, "yyyy-MM-dd");
      activities.push({
        title: cleanedTitle || cell,
        date: formattedDate,
        location: undefined,
        notes: cell,
        time: time || undefined,
        start_time: time || undefined,
        datetime: buildDatetime(formattedDate, time),
        description: cell,
        completed: false,
      });
    }
  }

  return { activities, hotels };
}

function findHeaderRow(rows) {
  for (let index = 0; index < Math.min(rows.length, 4); index += 1) {
    const row = rows[index] || [];
    const headers = row.map((value) => normalizeHeader(value));
    const hits = headers.reduce((count, cell) => {
      return count + (titleKeys.includes(cell) || dateKeys.includes(cell) || typeKeys.includes(cell) || locationKeys.includes(cell) || notesKeys.includes(cell) ? 1 : 0);
    }, 0);
    if (hits >= 2) {
      return { headers, headerIndex: index };
    }
  }
  return null;
}

export async function parseExcelActivities(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheet found in Excel file.");

  const rawRows = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    rawRows.push(row.values.slice(1));
  });

  if (rawRows.length === 0) return { activities: [], hotels: [] };

  const headerText = rawRows[0]?.[0] ? String(rawRows[0][0]) : "";
  const fileInfo = parseMonthYearFromText(file.name) || parseMonthYearFromText(headerText) || {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  if (isDateHeaderGrid(rawRows, fileInfo)) {
    const parsed = parseDateHeaderGrid(rawRows, fileInfo);
    if (parsed.activities.length > 0 || parsed.hotels.length > 0) return parsed;
  }

  if (isCalendarGrid(rawRows)) {
    const activities = parseCalendarGrid(rawRows, file.name);
    if (activities.length > 0) return { activities, hotels: [] };
  }

  const headerData = findHeaderRow(rawRows) || { headers: rawRows[0].map((cell) => normalizeHeader(cell)), headerIndex: 0 };
  const headerRow = headerData.headers;
  const dataRows = rawRows.slice(headerData.headerIndex + 1).filter((row) => row.some((value) => value !== null && value !== undefined && String(value).trim() !== ""));

  const activities = [];
  const hotelsByName = new Map();

  for (const rowCells of dataRows) {
    const rowObject = rowCells.reduce((acc, cell, index) => {
      const key = headerRow[index] || index.toString();
      acc[key] = cell;
      return acc;
    }, {});

    const normalized = normalizeRow(rowObject);
    const title = getRowValue(normalized, titleKeys);
    const date = parseDateValue(getRowValue(normalized, dateKeys));
    const location = getRowValue(normalized, locationKeys);
    const notes = getRowValue(normalized, notesKeys);
    const dedicatedTime = getRowValue(normalized, startTimeKeys);
    const { city, country } = parseCityCountryFromAddress(location || notes);
    const titleParsed = title ? extractTimeFromText(title) : { time: null, text: title };
    const notesParsed = notes ? extractTimeFromText(notes) : { time: null, text: notes };
    const finalTime = parseTimeValue(dedicatedTime) || titleParsed.time || notesParsed.time;
    const cleanedTitle = titleParsed.text || String(title || "").trim();
    const cleanedNotes = notesParsed.text || String(notes || "").trim();

    const isHotel = rowLooksLikeHotel(normalized);

    if (isHotel && title) {
      const normalizedHotelName = normalizeHotelKey(title);
      const hotelData = hotelsByName.get(normalizedHotelName) || {
        name: String(title).trim(),
        check_in: date,
        check_out: date,
        checkInDate: date,
        checkOutDate: date,
        address: location ? String(location).trim() : undefined,
        bookingPlatform: parseBookingPlatform(getRowValue(normalized, [...typeKeys, ...notesKeys, ...startTimeKeys])),
        price: parsePriceValue(getRowValue(normalized, priceKeys)),
        reservation_number: getRowValue(normalized, reservationKeys),        city: city || undefined,
        country: country || undefined,        platform: parseBookingPlatform(getRowValue(normalized, [...typeKeys, ...notesKeys, ...startTimeKeys])),
        createdAt: new Date().toISOString(),
      };

      if (date) {
        if (!hotelData.check_in || date < hotelData.check_in) hotelData.check_in = date;
        if (!hotelData.checkOutDate || date < hotelData.checkOutDate) hotelData.checkOutDate = date;
        if (!hotelData.check_out || date > hotelData.check_out) hotelData.check_out = date;
        if (!hotelData.checkOutDate || date > hotelData.checkOutDate) hotelData.checkOutDate = date;
      }

      if (!hotelData.address && location) hotelData.address = String(location).trim();
      if (!hotelData.city && city) hotelData.city = city;
      if (!hotelData.country && country) hotelData.country = country;
      if (!hotelData.bookingPlatform) hotelData.bookingPlatform = parseBookingPlatform(getRowValue(normalized, [...typeKeys, ...notesKeys, ...startTimeKeys]));
      if (hotelData.price === undefined) hotelData.price = parsePriceValue(getRowValue(normalized, priceKeys));
      if (!hotelData.reservation_number) hotelData.reservation_number = getRowValue(normalized, reservationKeys);
      if (!hotelData.platform) hotelData.platform = parseBookingPlatform(getRowValue(normalized, [...typeKeys, ...notesKeys, ...startTimeKeys]));

      hotelsByName.set(normalizedHotelName, hotelData);
      continue;
    }

    if (!title || !date) continue;

    activities.push({
      title: cleanedTitle,
      date,
      location: location ? String(location).trim() : undefined,
      notes: cleanedNotes || undefined,
      time: finalTime || undefined,
      start_time: finalTime || undefined,
      datetime: buildDatetime(date, finalTime),
      description: cleanedNotes || String(title).trim(),
      completed: false,
    });
  }

  const hotels = Array.from(hotelsByName.values()).map((hotel) => ({
    ...hotel,
    checkInDate: hotel.check_in,
    checkOutDate: hotel.check_out,
  }));

  const activitiesWithLogging = activities.map((activity) => ({
    ...activity,
    datetime: activity.time ? activity.datetime : undefined,
  }));

  console.debug("parseExcelActivities result:", { activities: activitiesWithLogging, hotels });
  return { activities: activitiesWithLogging, hotels };
}
