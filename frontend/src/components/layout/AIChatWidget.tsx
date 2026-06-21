"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      title: "Planification Caravane Ifrane",
      date: "Hier",
      messages: [
        { sender: "user", text: "Comment planifier la caravane d'Ifrane ?", timestamp: "14:32" },
        { sender: "bot", text: "Bonjour ! Pour planifier la caravane d'Ifrane, rendez-vous dans l'onglet 'Planning' sur votre barre latérale. Cliquez sur 'Programmer une formation', puis affectez le formateur de votre choix !", timestamp: "14:33" }
      ]
    },
    {
      id: "conv-2",
      title: "Problème GPS Formateur",
      date: "12 Mai",
      messages: [
        { sender: "user", text: "Le GPS ne fonctionne pas pour un formateur.", timestamp: "10:15" },
        { sender: "bot", text: "Bonjour. Si un formateur rencontre un problème de GPS sur le terrain, assurez-vous qu'il a bien accordé les permissions de géolocalisation à l'application mobile Expo Go ou compilez l'APK avec les permissions requises.", timestamp: "10:16" }
      ]
    }
  ]);

  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConvId, view]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      sender: "user",
      text: inputText,
      timestamp: time
    };

    // Update active conversation
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    setInputText("");

    // Simulate Bot Response after 1s
    setTimeout(() => {
      const botResponseText = getBotResponse(inputText);
      const botMessage: Message = {
        sender: "bot",
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: [...c.messages, botMessage]
          };
        }
        return c;
      }));
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const text = input.toLowerCase();
    
    // Gérer les salutations
    if (text.includes("bonjour") || text.includes("salut") || text.includes("hello")) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui dans le suivi de vos Caravanes Éducatives ?";
    }
    
    // Gérer la liste des formateurs (avec tolérance aux fautes de frappe comme 'dormateur')
    if (text.includes("formateur") || text.includes("dormateur") || text.includes("equipe") || text.includes("équipe")) {
      return "Voici la liste des formateurs actifs sur le terrain actuellement :\n\n• Youssef Alami (Caravane 1 - Province d'Ifrane)\n• Sara Kabbaj (Caravane 2 - Province de Midelt)\n• Amine Bennani (Caravane 3 - Province de Chefchaouen)\n\nVous pouvez les assigner à des écoles depuis l'onglet 'Planning' !";
    }

    if (text.includes("planning") || text.includes("planifier")) {
      return "Le planning est accessible depuis la barre de navigation. Vous pouvez programmer les ateliers par école et par formateur directement en un clic !";
    }
    if (text.includes("caravane") || text.includes("ecole") || text.includes("école")) {
      return "SmartCaravan dispose actuellement de 3 caravanes actives circulant dans les provinces rurales pour initier les élèves au codage.";
    }
    if (text.includes("cnpd") || text.includes("rgpd") || text.includes("photo")) {
      return "Toutes les photos de classe prises par les formateurs sont traitées par l'IA pour flouter les visages et garantir une totale conformité CNPD.";
    }
    return "Je suis ravi de vous aider dans la gestion de votre Caravane ! N'hésitez pas à me poser des questions sur le planning, les statistiques ou les formateurs (Youssef, Sara, etc.).";
  };

  const startNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: `Nouvelle discussion #${conversations.length + 1}`,
      date: "Aujourd'hui",
      messages: [
        { sender: "bot", text: "Bonjour ! Comment puis-je vous assister aujourd'hui dans vos caravanes ?", timestamp: "Maintenant" }
      ]
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    setView("chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Cute Floating Trigger using copied image */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-tr from-[#0B2B5B] to-[#00B4A0] rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50 hover:scale-110 active:scale-95 transition-all duration-300 relative group animate-bounce p-0 overflow-hidden"
        >
          <img 
            src="/chatbot-avatar.png" 
            alt="Assistant IA" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Notification Badge */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
          {/* Hover Tooltip (No emojis) */}
          <div className="absolute right-20 bg-[#0B2B5B] text-white text-xs font-bold px-3.5 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl">
            Besoin d'aide ? Discutons !
          </div>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-[#0B2B5B] to-[#00B4A0] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  src="/chatbot-avatar.png" 
                  alt="Avatar" 
                  className="w-8 h-8 object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">Assistant SmartCaravan</h4>
                <p className="text-[10px] text-teal-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  IA Active en ligne
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {view === "chat" ? (
                <button
                  onClick={() => setView("history")}
                  className="py-1 px-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-[11px] font-bold border border-white/10"
                >
                  Historique
                </button>
              ) : (
                <button
                  onClick={() => setView("chat")}
                  className="py-1 px-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-[11px] font-bold border border-white/10"
                >
                  Chat
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Panel Body: Chat View */}
          {view === "chat" && activeConv && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              {/* Title & Stats */}
              <div className="bg-white px-4 py-2 border-b border-slate-100 text-xs font-bold text-[#0B2B5B] flex justify-between items-center">
                <span className="truncate max-w-[200px]">Discussion: {activeConv.title}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{activeConv.date}</span>
              </div>

              {/* Messages scroll content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeConv.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm relative ${
                        msg.sender === "user"
                          ? "bg-[#00B4A0] text-white rounded-br-none"
                          : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                      }`}
                    >
                      <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                      <span
                        className={`text-[8px] font-bold block mt-1 text-right ${
                          msg.sender === "user" ? "text-teal-100" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Posez votre question..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4A0] text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 bg-[#0B2B5B] hover:bg-[#00B4A0] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 font-bold"
                >
                  ➔
                </button>
              </form>
            </div>
          )}

          {/* Panel Body: Conversation History View (Completely Emoji-free) */}
          {view === "history" && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                <span className="text-xs font-black text-[#0B2B5B]">Historique des discussions</span>
                <button
                  onClick={startNewConversation}
                  className="bg-[#00B4A0] hover:bg-[#009685] text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full transition flex items-center"
                >
                  Nouvelle discussion
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setView("chat");
                    }}
                    className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between group ${
                      conv.id === activeConvId
                        ? "bg-white border-[#00B4A0] shadow-md"
                        : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <p className="text-xs font-black text-[#0B2B5B] truncate group-hover:text-[#00B4A0] transition-colors">
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {conv.messages[conv.messages.length - 1]?.text || "Aucun message"}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full group-hover:bg-slate-200 transition">
                      {conv.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
