"use client";

import { useState, useCallback } from "react";
import { useSheetStore } from "@/components/ui/Sheet";

export function useFormSheet() {
  const sheet = useSheetStore();
  const [saving, setSaving] = useState(false);

  const open = useCallback(
    (content: React.ReactNode) => {
      sheet.show(content);
    },
    [sheet],
  );

  return { open, close: sheet.close, saving, setSaving };
}
