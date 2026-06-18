const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import TimelineView from "@/components/planner/TimelineView";
import TaskDialog from "@/components/planner/TaskDialog";
import GreetingHeader from "@/components/shared/GreetingHeader";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", dateStr],
    queryFn: () => db.entities.Task.filter({ date: dateStr }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Task.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const handleSave = (formData) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    setEditingTask(null);
  };

  const handleToggle = (task) => {
    updateMutation.mutate({ id: task.id, data: { completed: !task.completed } });
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  // Week days for quick navigation
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(
      subDays(selectedDate, selectedDate.getDay()),
      i
    );
    return d;
  });

  const taskSubtext = tasks.length === 0
    ? "No activities scheduled today."
    : `You have ${tasks.length} activit${tasks.length === 1 ? "y" : "ies"} scheduled today.`;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Greeting */}
      <GreetingHeader subtext={taskSubtext} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button
          onClick={() => { setEditingTask(null); setDialogOpen(true); }}
          className="rounded-2xl gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </motion.div>

      {/* Date Navigation */}
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
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
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
                <span className="text-[10px] font-medium uppercase">{format(day, "EEE")}</span>
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

      {/* Timeline */}
      <TimelineView
        tasks={tasks}
        onToggle={handleToggle}
        onTaskClick={handleTaskClick}
      />

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        selectedDate={dateStr}
        onSave={handleSave}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}