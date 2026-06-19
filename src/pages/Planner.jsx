import React, { useState } from "react";
import logger from "@/lib/logger";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import TimelineView from "@/components/planner/TimelineView";
import TaskDialog from "@/components/planner/TaskDialog";
import GreetingHeader from "@/components/shared/GreetingHeader";
import { useLocalData } from "@/context/LocalDataContext";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { tasks: allTasks, addTask, updateTask, deleteTask } = useLocalData();

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const tasks = allTasks.filter((task) => task.date === dateStr);

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
        <Button
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
          className="rounded-2xl gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </motion.div>

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