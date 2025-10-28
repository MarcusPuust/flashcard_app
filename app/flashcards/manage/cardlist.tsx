"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/types/flashcard";

export default function CardList({
  cards,
  onDeleteCard,
  onCardUpdated,
}: {
  cards: Card[];
  onDeleteCard: (id: string) => void;
  onCardUpdated: (card: Card) => void;
}) {
  const supabase = createClient();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  // kui kasutaja vajutab ✏️, avame dialoogi ja täidame väljad
  const startEdit = (card: Card) => {
    setEditingCard(card);
    setQuestion(card.question || "");
    setAnswer(card.answer || "");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cards").delete().eq("id", id);
    onDeleteCard(id);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setEditingCard(null);
  };

  const handleSave = async () => {
    if (!editingCard || !question.trim() || !answer.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("cards")
      .update({ question, answer })
      .eq("id", editingCard.id)
      .select("id,question,answer,category_id,created_at")
      .single();

    setSaving(false);
    if (error || !data) return;

    onCardUpdated(data as Card);
    setEditingCard(null);
  };

  // kui kategoorias pole kaarte
  if (cards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Selles kategoorias pole veel küsimusi.
      </Typography>
    );
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Küsimus</TableCell>
            <TableCell>Vastus</TableCell>
            <TableCell align="right">Toimingud</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell sx={{ wordBreak: "break-word" }}>
                {card.question}
              </TableCell>
              <TableCell sx={{ wordBreak: "break-word" }}>
                {card.answer}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => startEdit(card)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(card.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* inline dialoog samas failis */}
      <Dialog
        open={!!editingCard}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Muuda küsimust</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Küsimus"
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
          <Button onClick={handleCloseDialog} disabled={saving}>
            Loobu
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !question.trim() || !answer.trim()}
            variant="contained"
          >
            Salvesta
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
