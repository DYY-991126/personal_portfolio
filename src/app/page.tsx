"use client";

import AsciiMonitorBackdrop from "@/components/ui/AsciiMonitorBackdrop";
import TerminalHero from "@/components/ui/TerminalHero";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <AsciiMonitorBackdrop>
        <TerminalHero />
      </AsciiMonitorBackdrop>
    </div>
  );
}
