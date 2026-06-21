"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Info,
  ChevronRight,
  Bot,
  Loader2
} from "lucide-react";

const AssistantIAPage = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis l'assistant SmartCaravan propulsé par Groq. Je peux analyser vos données terrain, prédire les besoins en matériel ou vous aider à optimiser les tournées. Que souhaitez-vous savoir aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (data.error) {
         setMessages([...newMessages, { role: "assistant", content: `❌ Erreur de l'IA: ${data.error.message || data.error}` }]);
      } else if (data.choices && data.choices[0]) {
        setMessages([...newMessages, data.choices[0].message]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "⚠️ Je n'ai pas pu générer de réponse. L'API n'a rien renvoyé." }]);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: "assistant", content: `❌ Erreur réseau: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Prédire les besoins pour la semaine prochaine",
    "Analyser les performances de l'équipe Atlas",
    "Générer un résumé d'impact pour Ifrane",
    "Optimiser le trajet de la caravane Centre"
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-[40px] border border-border shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-brand-blue/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-brand-green">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-brand-blue">Assistant Intelligent</h1>
              <p className="text-[10px] font-bold text-brand-green flex items-center gap-1 uppercase tracking-widest">
                <Zap size={10} fill="currentColor" /> Moteur IA Actif
              </p>
            </div>
          </div>
          <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted" />
             ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-4 rounded-3xl ${
                m.role === "user" 
                  ? "bg-brand-blue text-white rounded-tr-none" 
                  : "bg-muted/50 text-brand-blue rounded-tl-none border border-border"
              }`}>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-muted/30 text-muted-foreground p-4 rounded-3xl rounded-tl-none border border-border animate-pulse">
                  <p className="text-xs font-bold italic">L'IA réfléchit...</p>
               </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-border bg-white">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              placeholder="Posez votre question à l'IA..."
              className="w-full pl-6 pr-16 py-4 bg-muted/30 border border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none transition-all font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className={`absolute right-2 top-2 bottom-2 px-5 text-white rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isLoading ? "bg-muted cursor-not-allowed" : "bg-brand-blue hover:bg-brand-green"
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar Insights */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-[#0B2B5B] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-brand-green/20 transition-all" />
           <h2 className="text-xl font-black mb-6 flex items-center gap-2">
             <Sparkles size={20} className="text-brand-green" /> Suggestions
           </h2>
           <div className="space-y-3">
             {suggestions.map((s, i) => (
               <button 
                 key={i} 
                 onClick={() => setInput(s)}
                 className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group/item"
               >
                 <span className="flex-1">{s}</span>
                 <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
               </button>
             ))}
           </div>
        </div>

        <div className="flex-1 bg-white p-6 rounded-[40px] border border-border shadow-sm">
           <h3 className="text-sm font-black text-brand-blue mb-4 flex items-center gap-2">
             <Info size={16} className="text-brand-green" /> Insights Récents
           </h3>
           <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Optimisation</p>
                 <p className="text-xs font-bold text-brand-blue leading-relaxed">Réduction possible de 12% des coûts logistiques sur la caravane Atlas.</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Impact</p>
                 <p className="text-xs font-bold text-brand-blue leading-relaxed">Pic d'engagement détecté à Marrakech entre 14h et 16h.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantIAPage;
