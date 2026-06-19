import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimeFormat } from "@/lib/TimeFormatContext";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

function getTaskPosition(task) {
  if (!task.start_time) return null;
  const [h, m] = task.start_time.split(":").map(Number);
  const startMin = (h - 6) * 60 + m;
  let durationMin = 60;
  if (task.end_time) {
    const [eh, em] = task.end_time.split(":").map(Number);
    durationMin = (eh - 6) * 60 + em - startMin;
  }
  return { top: startMin, height: Math.max(durationMin, 30) };
}

export default function TimelineView({ tasks, onToggle, onTaskClick }) {
  const { format: timeFormat } = useTimeFormat();

  const scheduledTasks = tasks.filter((t) => t.start_time);
  const unscheduledTasks = tasks.filter((t) => !t.start_time);

  const formatTime = (value) => {
    if (!value) return "";
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return value;
    if (timeFormat === "military") {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h >= 12 ? "PM" : "AM";
    return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Anytime</p>
          {unscheduledTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:shadow-md transition-all cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(task); }}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: task.color || "#6366f1" }} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                {task.subtasks?.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-3">Schedule</p>
        <div className="relative" style={{ height: HOURS.length * 64 }}>
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: (hour - 6) * 64 }}
            >
              <span className="text-xs text-muted-foreground w-14 text-right pr-3 -mt-2 font-medium flex-shrink-0">
                {hour === 0 ? "12 AM" : hour <= 12 ? `${hour} ${hour < 12 ? "AM" : "PM"}` : `${hour - 12} PM`}
              </span>
              <div className="flex-1 border-t border-border/60" />
            </div>
          ))}

          {/* Task blocks */}
          {scheduledTasks.map((task) => {
            const pos = getTaskPosition(task);
            if (!pos) return null;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute left-16 right-2 rounded-2xl p-3 cursor-pointer transition-shadow hover:shadow-lg overflow-hidden",
                  task.completed && "opacity-60"
                )}
                style={{
                  top: pos.top * (64 / 60),
                  height: Math.max(pos.height * (64 / 60), 40),
                  backgroundColor: task.color || "#6366f1",
                }}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(task); }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white/80" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium text-white truncate", task.completed && "line-through")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(task.start_time)} – {task.end_time ? formatTime(task.end_time) : "..."}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}