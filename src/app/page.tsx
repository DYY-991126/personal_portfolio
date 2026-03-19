"use client";

import AsciiMonitorBackdrop from "@/components/ui/AsciiMonitorBackdrop";
import TerminalHero from "@/components/ui/TerminalHero";

export default function Home() {
  return (
    <div className="h-screen w-full bg-background">
      <AsciiMonitorBackdrop>
        <TerminalHero />
      </AsciiMonitorBackdrop>
    </div>
  );
}
