"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2, Leaf, Wind, AlertTriangle, TrendingDown } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
};

const SYSTEM_PROMPT = `You are PRITHVI, an expert AI assistant for PRITHVI NET — an environmental intelligence and compliance platform focused on India and South Asia.

You are deeply knowledgeable about:
- Air quality indices (AQI) — Indian AQI scale (CPCB), US AQI, WHO guidelines
- Pollutants: PM2.5, PM10, NO2, SO2, CO, O3, NH3, Pb — sources, health impacts, safe limits
- Indian environmental regulations: Environment Protection Act 1986, Air (Prevention & Control of Pollution) Act 1981, National Clean Air Programme (NCAP), CPCB & SPCB norms
- Industrial compliance: emission standards by sector (power plants, cement, steel, textiles, chemicals), EIA process, consent to operate
- Pollution forecasting: meteorological factors, seasonal patterns (winter smog, crop burning), inversion layers
- High-risk industries: brick kilns, thermal power plants, vehicular emissions, waste burning, construction
- Health impacts by AQI category — vulnerable groups, advisories
- Emission reduction strategies: best available technologies (BAT), green transitions, carbon credits
- Real-time monitoring networks: CAAQMS, SAFAR, IQAir, OpenAQ
- Climate linkages: GHGs, carbon accounting, net-zero pathways for Indian industry

Personality & style:
- Be concise, data-driven, and practical
- Always cite relevant Indian standards or regulations where applicable
- Use AQI numbers, µg/m³ values, and percentage figures to make answers concrete
- For health questions, always mention vulnerable populations (children, elderly, respiratory patients)
- Format responses with clear structure — use short paragraphs, bullet points for lists, **bold** for key terms
- If asked about a specific city or region, tailor your answer to that geography
- Never make up data — if you don't have real-time data, say so and direct the user to CPCB or SAFAR

Respond in the same language the user writes in.`;

const SUGGESTIONS = [
  { label: "Pollution Forecast",   icon: Wind,          query: "What factors drive winter pollution spikes in North India and how can I forecast them?" },
  { label: "High Risk Industries", icon: AlertTriangle, query: "Which industries are the highest contributors to air pollution in India and what are their CPCB emission limits?" },
  { label: "AQI Health Impacts",   icon: Leaf,          query: "Explain the Indian AQI categories, their health implications, and what actions should be taken at each level." },
  { label: "Emission Reduction",   icon: TrendingDown,  query: "What are the most effective emission reduction strategies for thermal power plants under Indian CPCB norms?" },
];

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("### ")) return <h3 key={i} style={{ color: "#00e400", fontWeight: 700, fontSize: "0.85rem", margin: "10px 0 4px", letterSpacing: "0.04em" }} dangerouslySetInnerHTML={{ __html: formatted.slice(4) }} />;
    if (line.startsWith("## "))  return <h2 key={i} style={{ color: "#00e400", fontWeight: 700, fontSize: "0.9rem", margin: "12px 0 4px" }} dangerouslySetInnerHTML={{ __html: formatted.slice(3) }} />;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} style={{ display: "flex", gap: 8, margin: "3px 0", alignItems: "flex-start" }}>
        <span style={{ color: "#00e400", marginTop: 2, flexShrink: 0 }}>▸</span>
        <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
      </div>
    );
    if (line.match(/^\d+\. /)) return (
      <div key={i} style={{ display: "flex", gap: 8, margin: "3px 0" }}>
        <span style={{ color: "#00b4d8", flexShrink: 0, minWidth: 18, fontWeight: 700 }}>{line.match(/^(\d+)/)?.[1]}.</span>
        <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\. /, "") }} />
      </div>
    );
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ margin: "2px 0", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendQuery = useCallback(async (query: string) => {
    if (sending) return;
    setError(null);
    setSending(true);

    const aiMsgId = `a-${Date.now()}`;
    const now = Date.now();
    const historySnapshot = messages.slice(-10);

    setMessages(prev => [
      ...prev,
      { id: `u-${now}`, role: "user", content: query },
      { id: aiMsgId,    role: "ai",   content: "", streaming: true },
    ]);

    try {
      const historyMessages = historySnapshot.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyMessages,
            { role: "user", content: query },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || `API error ${response.status}`);
      }

      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";
      let   full    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              full += token;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: full } : m));
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `⚠ ${msg}`, streaming: false } : m));
      setError(msg);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [sending, messages]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    sendQuery(q);
  }, [input, sending, sendQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e6edf3", fontFamily: "'DM Mono', 'Fira Mono', monospace", display: "flex", flexDirection: "column", paddingTop: 72 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        strong { color: #e6edf3; font-weight: 600; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", height: "calc(100vh - 72px)" }}>

        {/* Header */}
        <div style={{ padding: "20px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #00e400, #00b4d8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 0 16px rgba(0,228,64,0.3)" }}>🌿</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em" }}>PRITHVI COPILOT</div>
              <div style={{ fontSize: "0.62rem", color: "#8b949e", letterSpacing: "0.1em" }}>AI ENVIRONMENTAL & COMPLIANCE INTELLIGENCE</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 0 8px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "48px 20px", color: "#484f58" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🌍</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#8b949e", marginBottom: 6 }}>
                Ask me anything about air quality & compliance
              </div>
              <div style={{ fontSize: "0.72rem", color: "#484f58" }}>
                AQI forecasts · CPCB norms · Emission standards · Health advisories
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
                {msg.role === "ai" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #00e400, #00b4d8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", marginRight: 10, marginTop: 2 }}>
                    🌿
                  </div>
                )}
                <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", fontSize: "0.8rem", lineHeight: 1.65, background: msg.role === "user" ? "linear-gradient(135deg, rgba(0,180,216,0.18), rgba(0,228,64,0.1))" : "rgba(255,255,255,0.04)", border: msg.role === "user" ? "1px solid rgba(0,180,216,0.3)" : "1px solid rgba(255,255,255,0.07)", color: msg.role === "user" ? "#a8d8ea" : "#c9d1d9" }}>
                  {msg.role === "ai" ? (
                    <>
                      {renderContent(msg.content)}
                      {msg.streaming && <span style={{ display: "inline-block", width: 7, height: 13, background: "#00e400", animation: "blink 1s step-end infinite", verticalAlign: "text-bottom", borderRadius: 2, marginLeft: 2 }} />}
                    </>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, paddingBottom: 20, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {messages.length === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {SUGGESTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.label} onClick={() => sendQuery(s.query)} disabled={sending}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#8b949e", fontSize: "0.72rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Mono', monospace" }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(0,228,64,0.08)"; b.style.borderColor = "rgba(0,228,64,0.25)"; b.style.color = "#00e400"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.04)"; b.style.borderColor = "rgba(255,255,255,0.08)"; b.style.color = "#8b949e"; }}>
                    <Icon size={13} style={{ flexShrink: 0 }} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about AQI, CPCB norms, emission standards…" disabled={sending}
              style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e6edf3", fontSize: "0.82rem", fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.15s" }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,228,64,0.4)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
            <button type="submit" disabled={sending || !input.trim()}
              style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(0,228,64,0.3)", background: "rgba(0,228,64,0.12)", color: "#00e400", cursor: sending || !input.trim() ? "not-allowed" : "pointer", opacity: !input.trim() && !sending ? 0.4 : 1, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontFamily: "'DM Mono', monospace" }}>
              {sending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
            </button>
            {messages.length > 0 && (
              <button type="button" onClick={() => { setMessages([]); setError(null); }}
                style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#484f58", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#ef4444"; b.style.borderColor = "rgba(239,68,68,0.3)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#484f58"; b.style.borderColor = "rgba(255,255,255,0.06)"; }}
                title="Clear chat">
                <Trash2 size={14} />
              </button>
            )}
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", fontSize: "0.7rem", color: "#f87171", fontFamily: "'DM Mono', monospace" }}>
              ⚠ {error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}