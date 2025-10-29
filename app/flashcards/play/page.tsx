"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import type { Card as CardType } from "@/types/flashcard";
import ModeSwitch from "./modeswitch";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function PlayPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("category");
  const initialModeFromUrl = searchParams.get("mode");

  const [mode, setMode] = useState<"random" | "ordered">(
    initialModeFromUrl === "ordered" ? "ordered" : "random"
  );
  const [cards, setCards] = useState<CardType[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const prepareCards = useCallback(
    (all: CardType[], m: "random" | "ordered") =>
      m === "ordered" ? all : shuffle(all),
    []
  );

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("cards").select("*");
      if (categoryFilter) query = query.eq("category_id", categoryFilter);

      const { data } = await query.order("created_at", { ascending: true });
      const raw = (data ?? []) as CardType[];
      setCards(prepareCards(raw, mode));
      setIndex(0);
      setUserAnswer("");
      setChecked(false);
      setIsCorrect(null);
    };
    load();
  }, [supabase, categoryFilter, mode, prepareCards]);

  const current = cards[index];

  const handleCheck = async () => {
    if (!current) return;
    const correct =
      userAnswer.trim().toLowerCase() === current.answer.trim().toLowerCase();
    setChecked(true);
    setIsCorrect(correct);
    await supabase
      .from("attempts")
      .insert({ card_id: current.id, is_correct: correct });
  };

  const handleNext = () => {
    setIndex((i) => i + 1);
    setUserAnswer("");
    setChecked(false);
    setIsCorrect(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // ülemine joondus
        px: 2,
        pt: 6, // vahe ülevalt
        pb: 8,
      }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 480 }}>
        <ModeSwitch mode={mode} setMode={setMode} />

        {!current ? (
          <Stack spacing={2} textAlign="center">
            <Typography variant="h6" fontWeight={600}>
              Kõik kaardid läbitud!
            </Typography>
          </Stack>
        ) : (
          <>
            {/* küsimus */}
            <Stack spacing={1.5}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
              >
                Kaart
              </Typography>
              <Divider />
              <Typography variant="h6" fontWeight={600}>
                {current.question}
              </Typography>
            </Stack>

            {/* õige vastus */}
            {checked && (
              <Stack
                spacing={1}
                sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Õige vastus:
                </Typography>
                <Typography>{current.answer}</Typography>
              </Stack>
            )}

            {/* vastuse sisestus */}
            {!checked ? (
              <Stack spacing={2}>
                <TextField
                  label="Sinu vastus"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  onClick={handleCheck}
                  disabled={!userAnswer.trim()}
                >
                  Kontrolli
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box
                  role="alert"
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isCorrect ? "success.main" : "error.main",
                    color: isCorrect ? "success.main" : "error.main",
                  }}
                >
                  {isCorrect ? "Õige!" : "Vale!"}
                </Box>
                <Button variant="contained" onClick={handleNext}>
                  Järgmine kaart →
                </Button>
              </Stack>
            )}

            <Divider />

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Kaart {index + 1} / {cards.length}{" "}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
