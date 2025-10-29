"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Container } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/flashcards";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      {!isLanding && (
        <Box
          sx={{
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2, // väikse sisemise serva saad ise määrata
          }}
        >
          <Box
            maxWidth="md"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Button
              component={Link}
              href="/flashcards"
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
              size="small"
              variant="text"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 14,
                px: 1,
                minWidth: "auto",
              }}
            >
              Avaleht
            </Button>
          </Box>
        </Box>
      )}

      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          pt: 1,
          pb: 2,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
