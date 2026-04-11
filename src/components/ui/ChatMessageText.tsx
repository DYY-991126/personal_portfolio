import React, { useState, useEffect } from 'react';
import { terminalAudio } from '@/lib/audio';

interface Props {
  content: string;
  theme?: "retro" | "modern";
  animate?: boolean;
}

const CONTACTS = [
  { value: "17623066004", label: "Phone" },
  { value: "dyyisgod@gmail.com", label: "Email" },
  { value: "_DYYYYYD_", label: "WeChat" }
];

function ContactLink({ contact, text, theme }: { contact: { label: string, value: string }, text: string, theme: "retro" | "modern" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.value).catch(() => {});
    terminalAudio?.playKeystroke();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (theme === "modern") {
    return (
      <span 
        onClick={handleCopy}
        className="cursor-pointer underline decoration-border underline-offset-2 hover:bg-foreground hover:text-background transition-colors relative inline-block rounded-sm px-0.5 -mx-0.5"
        title={`Click to copy ${contact.label}`}
      >
        {text}
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2.5 py-1 rounded-md font-medium tracking-wide whitespace-nowrap z-50 animate-in fade-in zoom-in duration-200 shadow-md">
            Copied!
          </span>
        )}
      </span>
    );
  }

  return (
    <span 
      onClick={handleCopy}
      className="cursor-pointer phosphor-text font-semibold underline decoration-[#00ff41]/65 underline-offset-2 hover:bg-[#00ff41]/20 hover:brightness-110 transition-colors relative inline-block group"
      title={`Click to copy ${contact.label}`}
    >
      {text}
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00ff41] text-[#020204] text-[10px] px-2 py-0.5 font-bold tracking-widest whitespace-nowrap z-50 animate-in fade-in zoom-in duration-200 shadow-[0_0_10px_rgba(0,255,65,0.8)]">
          [ COPIED! ]
        </span>
      )}
    </span>
  );
}

export function ChatMessageText({ content, theme = "retro", animate = false }: Props) {
  const [visibleLength, setVisibleLength] = useState(animate ? 0 : content.length);

  useEffect(() => {
    if (!animate) {
      setVisibleLength(content.length);
      return;
    }

    // Only animate if we are starting from 0 (meaning it's the first time this mounts with animate=true)
    // If content changes (e.g. real streaming), we might want to update differently, but here we just type out the static string.
    setVisibleLength(0);
    const speed = 30; // ms per char
    
    const interval = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev < content.length) {
          if (prev % 3 === 0 && theme === "retro") {
            terminalAudio?.playKeystroke();
          }
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(interval);
  }, [content, animate, theme]);

  const visibleContent = animate ? content.slice(0, visibleLength) : content;

  // We split the visibleContent by all contact values to find them and make them clickable
  const regex = new RegExp(`(${CONTACTS.map(c => c.value.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&')).join('|')})`, 'g');
  const parts = visibleContent.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const contact = CONTACTS.find(c => c.value === part);
        if (contact) {
          return <ContactLink key={i} contact={contact} text={part} theme={theme} />;
        }
        return (
          <span key={i} className={theme === "retro" ? "phosphor-dim font-normal" : undefined}>
            {part}
          </span>
        );
      })}
      {animate && visibleLength < content.length && (
        <span className={theme === "retro" ? "caret-block ml-1" : "inline-block w-1.5 h-3 ml-0.5 align-middle bg-foreground animate-pulse"} />
      )}
    </>
  );
}
