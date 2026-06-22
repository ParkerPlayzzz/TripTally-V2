import ExcelJS from 'exceljs';
import { promises as fs } from 'fs';
import path from 'path';
const filePath = path.resolve('C:/Users/Parker Lidgren/Downloads/Test Document.xlsx');
const workbook = new ExcelJS.Workbook();
const buffer = await fs.readFile(filePath);
await workbook.xlsx.load(buffer);
const worksheet = workbook.worksheets[0];
const rawRows = [];
worksheet.eachRow({ includeEmpty: false }, (row) => rawRows.push(row.values.slice(1)));
console.log('rawRows', JSON.stringify(rawRows, null, 2));

function sanitizeDateHeaderText(value) {
  const text = String(value || '').trim();
  return text.replace(/(\d+)(st|nd|rd|th)\b/i, '$1');
}
function parseDateHeaderValue(raw, fileInfo) {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === 'number') {
    return new Date(fileInfo.year, fileInfo.month - 1, raw);
  }
  const text = sanitizeDateHeaderText(raw);
  if (!text) return null;
  const hasYear = /\b20\d{2}\b/.test(text);
  const candidateText = hasYear ? text : `${text} ${fileInfo.year}`;
  const parsed = new Date(candidateText);
  console.log('parseDateHeaderValue', raw, '=>', text, 'candidate', candidateText, 'parsed', parsed, 'valid', !Number.isNaN(parsed.getTime()));
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const dayOnly = text.match(/^(\d{1,2})$/);
  if (dayOnly) return new Date(fileInfo.year, fileInfo.month - 1, Number(dayOnly[1]));
  return null;
}
function getDateHeaderConfig(firstRow, fileInfo) {
  const values = Array.isArray(firstRow) ? firstRow : [];
  const parsed = values.map((cell) => parseDateHeaderValue(cell, fileInfo));
  console.log('parsed values', parsed);
  const allDates = parsed.filter((date) => date);
  if (allDates.length >= 2) {
    return { dates: parsed, offset: 0 };
  }
  const shifted = values.slice(1).map((cell) => parseDateHeaderValue(cell, fileInfo));
  console.log('shifted values', shifted);
  const shiftedDates = shifted.filter((date) => date);
  if (shiftedDates.length >= 2) {
    return { dates: [null, ...shifted], offset: 1 };
  }
  return { dates: [], offset: 0 };
}
const fileInfo = { year: 2026, month: 6 };
console.log('fileInfo', fileInfo);
const config = getDateHeaderConfig(rawRows[0], fileInfo);
console.log('config', config);
console.log('is date header grid', config.dates.filter((date) => date).length >= 2);
