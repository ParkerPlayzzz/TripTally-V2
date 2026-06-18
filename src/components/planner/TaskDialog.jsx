import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useTransparency } from "@/lib/TransparencyContext";
import { glassStyle } from "@/lib/glassStyle";

// null = default (no override)
const COLORS = [
  { label: "Default", value: null },
  { label: "Indigo", value: "#6366f1" },
  { label: "Navy", value: "#1e3a5f" },
  { label: "Slate", value: "#475569" },
  { label: "Stone", value: "#78716c" },
  { label: "Sage", value: "#4d7c6f" },
  { label: "Sky", value: "#0369a1" },
  { label: "Rose", value: "#e11d48" },
  { label: "Amber", value: "#b45309" },
];

export default function TaskDialog({ open, onOpenChange, task, onSave, onDelete, selectedDate }) {
  const { opacity } = useTransparency();
  const [form, setForm] = useState(
    task || {
      title: "",
      description: "",
      date: selectedDate || new Date().toISOString().split("T")[0],
      start_time: "",
      end_time: "",
      priority: "medium",
      color: "#6366f1",
      category: "",
      subtasks: [],
    }
  );

  // Sync form when task prop changes
  React.useEffect(() => {
    setForm(task || {
      title: "",
      description: "",
      date: selectedDate || new Date().toISOString().split("T")[0],
      start_time: "",
      end_time: "",
      priority: "medium",
      color: "#6366f1",
      category: "",
      subtasks: [],
    });
  }, [task, open]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  const addSubtask = () =>
    setForm({ ...form, subtasks: [...(form.subtasks || []), { title: "", completed: false }] });

  const updateSubtask = (i, title) => {
    const updated = [...(form.subtasks || [])];
    updated[i] = { ...updated[i], title };
    setForm({ ...form, subtasks: updated });
  };

  const removeSubtask = (i) =>
    setForm({ ...form, subtasks: (form.subtasks || []).filter((_, idx) => idx !== i) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border border-border" style={glassStyle(opacity)}>
        {/* Title bar */}
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
            {task ? "Edit Task" : "New Task"}
          </p>
        </div>

        {/* Scrollable fields */}
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-border">
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Title</span>
            <input
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
              placeholder="Task name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Date</span>
            <input
              type="date"
              className="flex-1 bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <div className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Time</span>
            <div className="flex-1 flex items-center justify-end gap-2">
              <input
                type="time"
                className="bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
              <span className="text-muted-foreground/40 text-xs">–</span>
              <input
                type="time"
                className="bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Priority</span>
            <select
              className="flex-1 bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer capitalize"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <div className="px-5 py-3.5 border-b border-border">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs text-muted-foreground">Color</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.label}
                  title={c.label}
                  onClick={() => setForm({ ...form, color: c.value || "#6366f1" })}
                  className={`transition-all ${c.value === null ? "rounded-lg px-2 py-1 text-xs border border-border text-muted-foreground" : "w-6 h-6 rounded-full"} ${
                    (c.value === null && (!form.color || form.color === "#6366f1"))
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : form.color === c.value
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : "hover:scale-110 opacity-80"
                  }`}
                  style={c.value ? { backgroundColor: c.value } : {}}
                >
                  {c.value === null ? "↺" : null}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Notes</span>
            <textarea
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right resize-none min-h-[60px]"
              placeholder="Add notes…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          {/* Subtasks */}
          <div className="px-5 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs text-muted-foreground">Subtasks</span>
              <button onClick={addSubtask} className="flex items-center gap-1 text-xs text-foreground font-medium">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(form.subtasks || []).map((st, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                  <input
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
                    placeholder="Subtask…"
                    value={st.title}
                    onChange={(e) => updateSubtask(i, e.target.value)}
                  />
                  <button onClick={() => removeSubtask(i)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex border-t border-border divide-x divide-border">
          {task && onDelete ? (
            <button
              className="flex-1 py-3.5 text-sm text-destructive font-medium hover:bg-destructive/5 transition-colors"
              onClick={() => { onDelete(task.id); onOpenChange(false); }}
            >
              Delete
            </button>
          ) : null}
          <button
            className="flex-1 py-3.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
            onClick={handleSave}
            disabled={!form.title.trim()}
          >
            {task ? "Save" : "Add"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}