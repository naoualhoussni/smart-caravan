"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Send, ShieldCheck, Bot, User, Loader2,
  Lightbulb, BookOpen, HelpCircle, Trash2
} from "lucide-react";

const SUGGESTIONS = [
  { text: "Comment organiser un atelier Scratch ?", icon: BookOpen },
  { text: "Astuces pour motiver les élèves", icon: Lightbulb },
  { text: "Aide pour rédiger mon bilan", icon: HelpCircle },
];

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! 👋 Je suis l'assistant SmartCaravan. Je peux vous aider à préparer vos ateliers, rédiger vos bilans ou répondre à vos questions pédagogiques. Comment puis-je vous aider aujourd'hui ?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText) return;

    const userMsg: Message = { id: Date.now(), text: userText, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build history for context
    const history = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: userText }],
        }),
      });
      const data = await response.json();

      if (data.choices?.[0]) {
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: data.choices[0].message.content,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: "Désolé, la connexion à l'IA a échoué. Veuillez réessayer.", sender: "ai", timestamp: new Date() },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Serveur IA inaccessible. Vérifiez la connexion réseau.", sender: "ai", timestamp: new Date() },
      ]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Conversation réinitialisée. Comment puis-je vous aider ?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] pb-16 md:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Sparkles className="text-[#00B4A0]" size={28} />
            IA Coach
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Votre assistant intelligent pour les ateliers terrain
          </p>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
          title="Effacer la conversation"
        >
          <Trash2 size={18} />
        </button>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#1E293B]/50 rounded-3xl border border-white/5 overflow-hidden">
        {/* Context Badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00B4A0]/5 border-b border-white/5">
          <ShieldCheck size={14} className="text-[#00B4A0]" />
          <span className="text-xs font-bold text-[#00B4A0]">IA connectée au contexte SmartCaravan • Groq LLM</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === "ai"
                  ? "bg-gradient-to-br from-[#00B4A0] to-[#38BDF8]"
                  : "bg-[#0B2B5B]"
              }`}>
                {msg.sender === "ai" ? (
                  <Bot size={14} className="text-white" />
                ) : (
                  <User size={14} className="text-white" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-[#0B2B5B] to-[#0B2B5B]/80 text-white"
                  : "bg-white/5 text-slate-200"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-2 ${msg.sender === "user" ? "text-slate-400" : "text-slate-500"}`}>
                  {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00B4A0] to-[#38BDF8] flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white/5 rounded-2xl px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggestions (only show at start) */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-[#00B4A0]/10 border border-white/5 hover:border-[#00B4A0]/20 rounded-xl text-sm font-medium text-slate-300 hover:text-[#00B4A0] transition-all"
                >
                  <s.icon size={14} />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/5">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Demandez de l'aide à l'IA..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00B4A0]/50 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-4 rounded-xl font-bold transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? "bg-gradient-to-r from-[#00B4A0] to-[#00B4A0]/80 text-white shadow-lg shadow-[#00B4A0]/20"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
