"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Stack, Typography, Button, Divider, Paper } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import type { Category, Card } from "@/types/flashcard";
import CategoryList from "./categorylist";
import AddCategoryDialog from "./addcategory";
import AddCardDialog from "./addcard";
import CardList from "./cardlist";

export default function ManagePage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

  // laadimine
  useEffect(() => {
    const loadAll = async () => {
      const [{ data: catData }, { data: cardData }] = await Promise.all([
        supabase
          .from("categories")
          .select("id,name,created_at")
          .order("name", { ascending: true }),
        supabase
          .from("cards")
          .select("id,question,answer,category_id,created_at")
          .order("created_at", { ascending: false }),
      ]);

      const cats = (catData ?? []) as Category[];
      const cds = (cardData ?? []) as Card[];

      setCategories(cats);
      setCards(cds);

      if (!activeCategoryId && cats.length > 0) {
        setActiveCategoryId(cats[0].id);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // aktiivne kategooria
  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) || null,
    [categories, activeCategoryId]
  );

  // kaardid valitud kategoorias
  const filteredCards = useMemo(() => {
    if (!activeCategoryId) return [];
    return cards.filter((card) => card.category_id === activeCategoryId);
  }, [cards, activeCategoryId]);

  // kategooria CRUD
  const handleCategoryAdded = (newCat: Category) => {
    setCategories((prev) => {
      const next = [...prev, newCat].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      return next;
    });
    setActiveCategoryId(newCat.id);
  };

  const handleCategoryRenamed = (id: string, newName: string) => {
    setCategories((prev) =>
      [...prev]
        .map((c) => (c.id === id ? { ...c, name: newName } : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const handleCategoryDeleted = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setActiveCategoryId((curr) => {
      if (curr !== id) return curr;
      const remaining = categories.filter((c) => c.id !== id);
      return remaining.length ? remaining[0].id : null;
    });
  };

  // kaartide CRUD
  const handleCardAdded = (newCard: Card) => {
    setCards((prev) => [newCard, ...prev]);
  };

  const handleCardDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCardUpdated = (updated: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 6,
        pb: 8,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{
          width: "100%",
          maxWidth: 1000,
        }}
      >
        {/* KATEGOORIAD */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, minWidth: 0, p: 2, borderRadius: 2 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Kategooriad
            </Typography>

            <Button
              variant="contained"
              size="small"
              onClick={() => setAddCategoryOpen(true)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              + Uus kategooria
            </Button>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.4, mb: 2 }}
          >
            Vali kategooria (kliki nimele), muuda või kustuta.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <CategoryList
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={(id) => setActiveCategoryId(id)}
            onCategoryRenamed={handleCategoryRenamed}
            onCategoryDeleted={handleCategoryDeleted}
          />
        </Paper>

        {/* KAARDID */}
        <Paper
          variant="outlined"
          sx={{ flex: 2, minWidth: 0, p: 2, borderRadius: 2 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ wordBreak: "break-word" }}
              >
                {activeCategory ? activeCategory.name : "Küsimused"}
              </Typography>

              {!activeCategory ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.4 }}
                >
                  Vali vasakult kategooria.
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.4 }}
                >
                  {filteredCards.length} kaarti selles kategoorias.
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              size="small"
              disabled={!activeCategoryId}
              onClick={() => setAddCardOpen(true)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              + Uus kaart
            </Button>
          </Stack>

          {!activeCategory ? (
            <Typography variant="body2" color="text.secondary">
              Vali kõigepealt kategooria vasakult.
            </Typography>
          ) : filteredCards.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Selles kategoorias pole veel kaarte.
            </Typography>
          ) : (
            <>
              <Divider sx={{ mb: 2 }} />
              <CardList
                cards={filteredCards}
                onDeleteCard={handleCardDeleted}
                onCardUpdated={handleCardUpdated}
              />
            </>
          )}
        </Paper>
      </Stack>

      {/* Dialoogid */}
      <AddCategoryDialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onAdded={(cat) => {
          handleCategoryAdded(cat);
          setAddCategoryOpen(false);
        }}
      />

      <AddCardDialog
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        categoryId={activeCategoryId}
        onAdded={(card) => {
          handleCardAdded(card);
          setAddCardOpen(false);
        }}
      />
    </Box>
  );
}
