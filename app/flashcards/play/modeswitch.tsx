"use client";

import { Stack, Button } from "@mui/material";

export default function ModeSwitch({
  mode,
  setMode,
}: {
  mode: "random" | "ordered";
  setMode: (m: "random" | "ordered") => void;
}) {
  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant={mode === "random" ? "contained" : "outlined"}
        size="small"
        onClick={() => setMode("random")}
      >
        Juhuslik
      </Button>
      <Button
        variant={mode === "ordered" ? "contained" : "outlined"}
        size="small"
        onClick={() => setMode("ordered")}
      >
        Järjekorras
      </Button>
    </Stack>
  );
}
