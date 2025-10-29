"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Box, Typography, Paper, Stack, Divider } from "@mui/material";

type AttemptRow = {
  is_correct: boolean;
  answered_at: string; // ISO string
};

export default function StatsPage() {
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctPct, setCorrectPct] = useState(0);

  const [todayStats, setTodayStats] = useState({ attempts: 0, acc: 0 });
  const [last7Stats, setLast7Stats] = useState({ attempts: 0, acc: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // Pull only necessary columns
        const { data, error } = await supabase
          .from("attempts")
          .select("is_correct, answered_at")
          .order("answered_at", { ascending: false });

        if (error) throw error;

        const attempts = (data ?? []) as AttemptRow[];

        if (attempts.length === 0) {
          setTotal(0);
          setCorrectCount(0);
          setWrongCount(0);
          setCorrectPct(0);
          setTodayStats({ attempts: 0, acc: 0 });
          setLast7Stats({ attempts: 0, acc: 0 });
          return;
        }

        let totalCorrect = 0;

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let todayAttempts = 0;
        let todayCorrect = 0;
        let last7Attempts = 0;
        let last7Correct = 0;

        for (const row of attempts) {
          if (row.is_correct) totalCorrect += 1;

          const t = new Date(row.answered_at);

          if (t >= startOfToday) {
            todayAttempts += 1;
            if (row.is_correct) todayCorrect += 1;
          }
          if (t >= sevenDaysAgo) {
            last7Attempts += 1;
            if (row.is_correct) last7Correct += 1;
          }
        }

        const totalAttempts = attempts.length;
        setTotal(totalAttempts);
        setCorrectCount(totalCorrect);
        setWrongCount(totalAttempts - totalCorrect);
        setCorrectPct(totalAttempts ? totalCorrect / totalAttempts : 0);

        setTodayStats({
          attempts: todayAttempts,
          acc: todayAttempts ? todayCorrect / todayAttempts : 0,
        });
        setLast7Stats({
          attempts: last7Attempts,
          acc: last7Attempts ? last7Correct / last7Attempts : 0,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const correctPctDisplay = useMemo(
    () => `${Math.round(correctPct * 100)}%`,
    [correctPct]
  );
  const todayAccDisplay = useMemo(
    () => `${Math.round(todayStats.acc * 100)}%`,
    [todayStats.acc]
  );
  const last7AccDisplay = useMemo(
    () => `${Math.round(last7Stats.acc * 100)}%`,
    [last7Stats.acc]
  );

  if (loading) return <Typography sx={{ p: 4 }}>Laen andmeid…</Typography>;
  if (error)
    return (
      <Typography color="error" sx={{ p: 4 }}>
        {error}
      </Typography>
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
      <Stack spacing={4} sx={{ width: "100%", maxWidth: 800 }}>
        {/* Pealkiri + intro */}
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            Statistika
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.4 }}
          >
            Ülevaade sinu vastamistest.
          </Typography>
        </Stack>

        {/* Üldine statistika */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <StatRow label="Kokku vastuseid" value={total} />
          <StatRow label="Õigeid" value={correctCount} />
          <StatRow label="Valesid" value={wrongCount} />
          <StatRow label="Täpsus" value={correctPctDisplay} />
        </Paper>

        {/* Perioodi kiirnumbrid */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Perioodid
          </Typography>
          <StatRow label="Täna - vastuseid" value={todayStats.attempts} />
          <StatRow label="Täna - täpsus" value={todayAccDisplay} />
          <Divider sx={{ my: 1 }} />
          <StatRow
            label="Viimased 7 päeva - vastuseid"
            value={last7Stats.attempts}
          />
          <StatRow label="Viimased 7 päeva - täpsus" value={last7AccDisplay} />
        </Paper>
      </Stack>
    </Box>
  );
}

/** Väike helper rea kuvamiseks statistika kastis */
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
        sx={{ fontSize: 13, lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 500, fontSize: 15, lineHeight: 1.4 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
