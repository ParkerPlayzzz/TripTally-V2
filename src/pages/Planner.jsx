import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logger from "@/lib/logger";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { motion } from "framer-motion";
import TimelineView from "@/components/planner/TimelineView";
import TaskDialog from "@/components/planner/TaskDialog";
import GreetingHeader from "@/components/shared/GreetingHeader";
import { parseExcelActivities } from "@/lib/excel-import";
import { useLocalData } from "@/context/LocalDataContext";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const importInputRef = useRef(null);
  const navigate = useNavigate();

  const { tasks: allTasks, hotels: allHotels, addTask, addHotel, updateTask, deleteTask } = useLocalData();

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const tasks = allTasks
    .filter((task) => task.date === dateStr)
    .sort((a, b) => {
      const timeA = a.start_time || a.time || "";
      const timeB = b.start_time || b.time || "";
      if (timeA && timeB) return timeA.localeCompare(timeB);
      if (timeA) return -1;
      if (timeB) return 1;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

  const hotelsForDate = allHotels.filter((hotel) => {
    if (!hotel.check_in || !hotel.check_out) return false;
    return dateStr >= hotel.check_in && dateStr <= hotel.check_out;
  });

  const handleSave = (formData) => {
    logger.debug("Planner.handleSave editingTask:", editingTask, "formData:", formData);
    if (editingTask) {
      logger.debug("Planner.handleSave -> updateTask", editingTask.id);
      updateTask(editingTask.id, { ...formData });
    } else {
      logger.debug("Planner.handleSave -> addTask");
      addTask({
        ...formData,
        completed: false,
      });
    }

    setEditingTask(null);
    setDialogOpen(false);
  };

  const handleToggle = (task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setEditingTask(null);
    setDialogOpen(false);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setImportMessage("Please select a valid .xlsx file.");
      event.target.value = "";
      return;
    }

    try {
      const imported = await parseExcelActivities(file);
      const importedActivities = imported.activities || [];
      const importedHotels = imported.hotels || [];

      if (importedActivities.length === 0 && importedHotels.length === 0) {
        setImportMessage("No valid activities or hotels were found in this spreadsheet.");
      } else {
        importedActivities.forEach((activity) => addTask(activity));
        importedHotels.forEach((hotel) => addHotel({
          name: hotel.name,
          check_in: hotel.checkInDate || hotel.check_in,
          check_out: hotel.checkOutDate || hotel.check_out,
          guests: hotel.guests || 1,
          country: hotel.country || "",
          city: hotel.city || "",
          price: hotel.price || 0,
          currency: hotel.currency || "USD",
          platform: hotel.bookingPlatform || hotel.platform,
          address: hotel.address,
          logo_url: hotel.logo_url,
          reservation_number: hotel.reservation_number,
        }));

        setImportMessage(`Imported ${importedActivities.length} activities and ${importedHotels.length} hotels into the planner.`);
        if (importedActivities[0]?.date) {
          setSelectedDate(new Date(importedActivities[0].date));
        } else if (importedHotels[0]?.checkInDate) {
          setSelectedDate(new Date(importedHotels[0].checkInDate));
        }
        navigate("/planner");
      }
    } catch (error) {
      console.error("Spreadsheet import failed", error);
      setImportMessage("Unable to import the spreadsheet. Please check the file format.");
    } finally {
      event.target.value = "";
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(subDays(selectedDate, selectedDate.getDay()), i);
    return d;
  });

  const taskSubtext =
    tasks.length === 0
      ? "No activities scheduled today."
      : `You have ${tasks.length} activit${tasks.length === 1 ? "y" : "ies"} scheduled today.`;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <GreetingHeader subtext={taskSubtext} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditingTask(null);
              setDialogOpen(true);
            }}
            className="rounded-2xl gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Task
          </Button>
          <Button onClick={handleImportClick} variant="outline" className="rounded-2xl gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
            <Upload className="w-4 h-4" /> Import Excel
          </Button>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImportChange}
        />
      </motion.div>

      {importMessage ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 mb-6">
          {importMessage}
        </div>
      ) : null}

      {hotelsForDate.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hotels</p>
              <p className="text-sm text-muted-foreground">Hotel stays for this day</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {hotelsForDate.map((hotel) => (
              <div key={hotel.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{hotel.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {hotel.check_in} → {hotel.check_out}
                    </p>
                  </div>
                  {hotel.platform && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      {hotel.platform}
                    </span>
                  )}
                </div>
                {hotel.address && <p className="text-sm text-muted-foreground mt-3">{hotel.address}</p>}
                {hotel.reservation_number && (
                  <p className="text-sm text-muted-foreground mt-2">Reservation: {hotel.reservation_number}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 mb-8"
      >
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 7))}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
          {weekDays.map((day) => {
            const isSelected = format(day, "yyyy-MM-dd") === dateStr;
            const isToday =
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-1 min-w-[48px] flex flex-col items-center py-2.5 px-2 rounded-2xl transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : isToday
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {format(day, "EEE")}
                </span>
                <span className="text-lg font-bold mt-0.5">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      <TimelineView tasks={tasks} onToggle={handleToggle} onTaskClick={handleTaskClick} />

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        selectedDate={dateStr}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}