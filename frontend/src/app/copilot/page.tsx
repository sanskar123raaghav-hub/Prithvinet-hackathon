"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CopilotPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch(`${API_URL}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-accent-cyan" />
            AI Compliance Copilot
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Ask environmental and compliance questions
          </p>
        </motion.div>

        {/* Input */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. How to reduce emissions in industrial zones?"
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan/40"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-mono text-sm hover:bg-accent-cyan/20 transition-all disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </motion.form>

        {/* Response */}
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-accent-green/20 bg-accent-green/5"
          >
            <p className="text-xs font-mono text-accent-green mb-3">
              AI INSIGHT
            </p>
            <p className="text-sm text-slate-300 font-mono leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 font-mono">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
