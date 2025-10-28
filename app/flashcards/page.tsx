"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Box, Typography, Stack, Button } from "@mui/material";

export default function Page() {
  // each button gets static colors now (bg + text + border + hover)
  const items = [
    {
      label: "Mängi",
      href: "/flashcards/play?mode=random",
      styles: {
        bg: "rgba(80,140,255,0.12)",
        hoverBg: "rgba(80,140,255,0.18)",
        text: "rgb(80,140,255)",
        border: "rgba(80,140,255,0.4)",
        shadow: "rgba(80,140,255,0.4)",
      },
    },
    {
      label: "Halda kategooriaid ja kaarte",
      href: "/flashcards/manage",
      styles: {
        bg: "rgba(160,160,180,0.12)",
        hoverBg: "rgba(160,160,180,0.18)",
        text: "rgb(150,150,170)",
        border: "rgba(160,160,180,0.4)",
        shadow: "rgba(160,160,180,0.4)",
      },
    },
    {
      label: "Statistika",
      href: "/flashcards/stats",
      styles: {
        bg: "rgba(120,200,170,0.12)",
        hoverBg: "rgba(60,200,170,0.18)",
        text: "rgb(120,200,170)",
        border: "rgba(60,200,170,0.4)",
        shadow: "rgba(60,200,170,0.4)",
      },
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      {/* Title / intro */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Box sx={{ maxWidth: 420, mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            Flashcards
          </Typography>
        </Box>
      </motion.div>

      {/* Buttons */}
      <Stack
        spacing={2.5}
        sx={{
          width: "100%",
          maxWidth: 400,
          mt: 6,
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
          >
            <Button
              component={Link}
              href={item.href}
              fullWidth
              sx={{
                py: 2.5,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                textTransform: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.styles.bg,
                color: item.styles.text,
                border: "1px solid",
                borderColor: item.styles.border,
                boxShadow: "none",
                transition: "all 0.22s ease",
                "&:hover": {
                  backgroundColor: item.styles.hoverBg,
                  boxShadow: `0 6px 16px ${item.styles.shadow}`,
                },
              }}
            >
              {item.label}
            </Button>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}
