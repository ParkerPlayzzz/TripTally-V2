import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalData } from "@/context/LocalDataContext";

export default function FirstRunDialog() {
  const { userName, setUserName } = useLocalData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!userName) {
      setOpen(true);
    }
  }, [userName]);

  const save = () => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">Welcome 👋</h3>
        <p className="text-sm text-muted-foreground mb-4">What's your first name? We'll use it to address you in the app.</p>
        <div className="flex gap-2 mb-4">
          <Input placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
