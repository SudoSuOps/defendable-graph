"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="inline-flex items-center gap-2 rounded-md border border-verified/35 bg-verified/10 px-3 py-2 text-sm font-semibold text-verified"><Copy size={14} />{copied ? "Copied" : label}</button>;
}
