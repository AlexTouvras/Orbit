"use client";

import { useState } from "react";
import { LoginForm } from "@/components/studio/LoginForm";

export function EmergencyPasswordAccess({ next }: { next: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-slate-400 transition-colors hover:text-white"
      >
        {open ? "Hide emergency access" : "Emergency access (password)"}
      </button>
      {open ? (
        <div className="mt-4">
          <LoginForm next={next} />
        </div>
      ) : null}
    </div>
  );
}
