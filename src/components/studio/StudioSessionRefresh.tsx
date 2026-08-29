"use client";

import { useEffect } from "react";

/** Quietly extends the Studio cookie while you are using Studio. */
export function StudioSessionRefresh() {
  useEffect(() => {
    void fetch("/api/studio/session", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
