import React from "react";
import { OPEN_TO_WORK } from "@/lib/site";

export default function Pill() {
  if (!OPEN_TO_WORK) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 font-mono text-[12px] text-muted select-none">
      <span className="relative flex h-[7px] w-[7px]">
        <span className="inline-flex h-full w-full rounded-full bg-primary ring-[3px] ring-primary-glow" />
      </span>
      <span>Open to backend roles</span>
    </div>
  );
}
