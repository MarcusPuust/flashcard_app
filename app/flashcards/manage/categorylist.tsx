"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { Category } from "@/types/flashcard";

export default function CategoryList({
  categories,
  activeCategoryId,
  onSelectCategory,
  onCategoryRenamed,
  onCategoryDeleted,
}: {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onCategoryRenamed: (id: string, newName: string) => void;
  onCategoryDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleSave = async () => {
    if (!editId || !editName.trim()) return;
    await supabase
      .from("categories")
      .update({ name: editName })
      .eq("id", editId);
    onCategoryRenamed(editId, editName);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    onCategoryDeleted(id);
  };

  return (
    <List dense>
      {categories.map((cat) => (
        <ListItem
          key={cat.id}
          disableGutters
          secondaryAction={
            editId === cat.id ? null : (
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditId(cat.id);
                    setEditName(cat.name);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(cat.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )
          }
        >
          {editId === cat.id ? (
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <TextField
                size="small"
                fullWidth
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Button size="small" variant="contained" onClick={handleSave}>
                OK
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setEditId(null);
                }}
              >
                Tühista
              </Button>
            </Stack>
          ) : (
            <ListItemButton
              onClick={() => onSelectCategory(cat.id)}
              selected={cat.id === activeCategoryId}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText
                primary={cat.name}
                primaryTypographyProps={{
                  fontWeight: cat.id === activeCategoryId ? 600 : 400,
                }}
              />
            </ListItemButton>
          )}
        </ListItem>
      ))}
    </List>
  );
}
