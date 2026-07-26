"use client";

import { motion } from "framer-motion";
import { FileVideo, FileText, Image, Download, BookOpen } from "lucide-react";

const RESSOURCES = [
  { type: "video", titre: "Introduction à la Robotique - Séance 1", module: "IoT & Robotique", taille: "45 MB", date: "15/07/2026" },
  { type: "doc", titre: "Guide Formateur - Module Scratch", module: "Scratch", taille: "2.1 MB", date: "10/07/2026" },
  { type: "video", titre: "Tutoriel Programmation Python - Débutant", module: "Programmation", taille: "120 MB", date: "08/07/2026" },
  { type: "image", titre: "Photos de la caravane - Province Tinghir", module: "Médias", taille: "18 MB", date: "01/07/2026" },
  { type: "doc", titre: "Fiche pédagogique - Comportement conceptuel", module: "Comportement conceptuel", taille: "1.5 MB", date: "25/06/2026" },
  { type: "video", titre: "Démonstration montage circuit Arduino", module: "IoT & Robotique", taille: "90 MB", date: "20/06/2026" },
];

const MODULE_COLORS: Record<string, string> = {
  "IoT & Robotique": "bg-[#1F3C6D]/10 text-[#1F3C6D]",
  "Scratch": "bg-[#A4C639]/10 text-[#A4C639]",
  "Programmation": "bg-[#5E9FA3]/10 text-[#5E9FA3]",
  "Comportement conceptuel": "bg-[#FDB813]/10 text-[#FDB813]",
  "Médias": "bg-purple-500/10 text-purple-400",
};

const typeIcon = (type: string) => {
  if (type === "video") return <FileVideo size={20} className="text-[#5E9FA3]" />;
  if (type === "image") return <Image size={20} className="text-[#A4C639]" />;
  return <FileText size={20} className="text-[#FDB813]" />;
};

export default function FormateurRessourcesPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FDB813]/10 flex items-center justify-center">
              <BookOpen className="text-[#FDB813]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Supports Pédagogiques</h1>
              <p className="text-slate-400 text-sm">Tous vos documents, vidéos et photos de formation</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {RESSOURCES.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#1E293B] rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4 hover:border-[#FDB813]/20 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {typeIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{res.titre}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[res.module] || "bg-white/5 text-slate-400"}`}>
                      {res.module}
                    </span>
                    <span className="text-[10px] text-slate-500">{res.taille} · {res.date}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => alert(`Téléchargement : ${res.titre}`)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#FDB813] hover:text-[#1F3C6D] text-slate-400 font-bold text-xs transition-all"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
