"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function EventSimulator() {
  const [state, setState] = useState("Simulate event");
  async function simulate() {
    setState("Emitting...");
    try {
      await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "receipt.created", actorId: "defendablerouter", subjectId: "receipt_9f2c", receiptHash: `sha256:sim-${Date.now()}`, status: "verified", metadata: { simulated: true } }) });
      setState("Event emitted");
    } catch { setState("Local DB required"); }
    setTimeout(() => setState("Simulate event"), 1600);
  }
  return <button onClick={simulate} className="inline-flex items-center gap-2 rounded-md border border-honey-300/40 bg-honey-300/10 px-4 py-2 text-sm font-semibold text-honey-200"><Sparkles size={15} />{state}</button>;
}
