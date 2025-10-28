"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import type { Category } from "@/types/flashcard";

export default function AddCategoryDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (cat: Category) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState("");

  const handleSave = async () => {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name })
      .select("id,name,created_at")
      .single();

    if (!error && data) {
      onAdded(data as Category); // teavita ülespoole
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Uus kategooria</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          autoFocus
          label="Nimi"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Katkesta</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Salvesta
        </Button>
      </DialogActions>
    </Dialog>
  );
}
