"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Paper,
  Stack,
} from "@mui/material";

type CardAccuracy = {
  card_id: string;
  question: string;
  attempts: number;
  correct: number;
  accuracy: number;
};

export default function StatsPage() {
  const [total, setTotal] = useState(0);
  const [correctPct, setCorrectPct] = useState(0);
  const [hardest, setHardest] = useState<CardAccuracy[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // kõik attemptid
      const { data: attempts } = await supabase
        .from("attempts")
        .select("card_id,is_correct");

      if (!attempts || attempts.length === 0) {
        setTotal(0);
        setCorrectPct(0);
        setHardest([]);
        return;
      }

      // agregeerime katsete kaupa kaarditi
      const map: Record<string, { attempts: number; correct: number }> = {};
      for (const row of attempts) {
        if (!map[row.card_id]) {
          map[row.card_id] = { attempts: 0, correct: 0 };
        }
        map[row.card_id].attempts += 1;
        if (row.is_correct) {
          map[row.card_id].correct += 1;
        }
      }

      const ids = Object.keys(map);

      // küsimuse tekstid kaartidelt
      const { data: cardsData } = await supabase
        .from("cards")
        .select("id,question")
        .in("id", ids);

      const list: CardAccuracy[] = ids.map((id) => {
        const agg = map[id];
        const q =
          cardsData?.find((c) => c.id === id)?.question ??
          "(kaardi tekst puudub)";
        return {
          card_id: id,
          question: q,
          attempts: agg.attempts,
          correct: agg.correct,
          accuracy: agg.correct / agg.attempts,
        };
      });

      // kogu statistika
      const totalAttempts = attempts.length;
      const totalCorrect = attempts.filter((a) => a.is_correct).length;
      setTotal(totalAttempts);
      setCorrectPct(totalCorrect / totalAttempts);

      // raskemad kaardid (madalaim accuracy, ainult need millel >=3 katset)
      const hardestSorted = list
        .filter((c) => c.attempts >= 3)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);

      setHardest(hardestSorted);
    };

    load();
  }, []);

  const correctPctDisplay = useMemo(
    () => `${Math.round(correctPct * 100)}%`,
    [correctPct]
  );

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
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: 800,
        }}
      >
        {/* pealkiri + intro */}
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            Statistika
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.4 }}
          >
            Ülevaade sinu vastamistest ja raskematest kaartidest.
          </Typography>
        </Stack>

        {/* üldine statistika */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <StatRow label="Kokku vastuseid" value={total} />
          <StatRow label="Õigeid kokku" value={correctPctDisplay} />
        </Paper>

        <Divider />

        {/* raskemad kaardid */}
        <Stack spacing={1}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ lineHeight: 1.3 }}
          >
            Raskemad kaardid
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.4 }}
          >
            Kaardid, millele vastad tihti valesti (vähemalt 3 korda).
          </Typography>
        </Stack>

        {hardest.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Pole veel piisavalt andmeid.
          </Typography>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Küsimus</TableCell>
                  <TableCell>Katsed</TableCell>
                  <TableCell>Õige %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hardest.map((row) => (
                  <TableRow key={row.card_id}>
                    <TableCell
                      sx={{
                        maxWidth: 400,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontSize: 13,
                      }}
                    >
                      {row.question}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{row.attempts}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {Math.round(row.accuracy * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

// väike helper rea kuvamiseks statistika kastis
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 0.5,
        mb: 1.5,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: 13,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          fontSize: 15,
          lineHeight: 1.4,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
