"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/types/flashcard";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: (card: Card) => void;
  categoryId: string | null;
};

export default function AddCardDialog({
  open,
  onClose,
  onAdded,
  categoryId,
}: Props) {
  const supabase = createClient();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!categoryId || !question.trim() || !answer.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("cards")
      .insert({ question, answer, category_id: categoryId })
      .select("id,question,answer,category_id,created_at")
      .single();

    setSaving(false);
    if (error || !data) return;

    onAdded(data as Card);
    setQuestion("");
    setAnswer("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisa uus kaart</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Kaart"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Õige vastus"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Loobu
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !categoryId || !question.trim() || !answer.trim()}
          variant="contained"
        >
          Salvesta
        </Button>
      </DialogActions>
    </Dialog>
  );
}
