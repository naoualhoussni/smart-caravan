"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, CheckCircle2, XCircle, Clock, Download,
  MessageSquare, Phone, ChevronDown, AlertTriangle, Plus, Send
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface Rapport {
  id: string;
  titre: string;
  province: string;
  date: string;
  statut: "valide" | "refuse" | "en_attente";
  commentaire_coordinateur?: string;
}

interface Appel {
  id: string;
  directeur: string;
  ecole: string;
  date: string;
  heure: string;
  duree: string;
  objet: string;
  statut: "planifie" | "effectue" | "manque";
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_RAPPORTS: Rapport[] = [
  { id: "1", titre: "Rapport d'installation - Lycée Bamou", province: "Tinghir", date: "2026-07-20", statut: "valide", commentaire_coordinateur: "Excellent travail, tous les équipements fonctionnels." },
  { id: "2", titre: "Rapport de maintenance - Collège Ibn Sina", province: "Tinghir", date: "2026-07-18", statut: "refuse", commentaire_coordinateur: "Le rapport est incomplet. Veuillez ajouter les photos du matériel installé et la liste des équipements manquants." },
  { id: "3", titre: "Rapport de désinstallation - Lycée Hassan II", province: "Zagora", date: "2026-07-25", statut: "en_attente" },
  { id: "4", titre: "Rapport d'intervention - Lycée Al Farabi", province: "Ouarzazate", date: "2026-07-22", statut: "valide", commentaire_coordinateur: "Rapport conforme aux standards." },
];

const MOCK_APPELS: Appel[] = [
  { id: "1", directeur: "M. Khalid Bensalem", ecole: "Lycée Bamou", date: "2026-07-26", heure: "10:00", duree: "15 min", objet: "Vérification de l'installation des postes informatiques", statut: "effectue" },
  { id: "2", directeur: "Mme Fatima Zorah", ecole: "Collège Ibn Sina", date: "2026-07-27", heure: "14:30", duree: "—", objet: "Planification de la récupération du matériel", statut: "planifie" },
  { id: "3", directeur: "M. Youssef Alami", ecole: "Lycée Hassan II", date: "2026-07-24", heure: "09:00", duree: "—", objet: "Suivi état équipements", statut: "manque" },
];

// ─── Statut Badge ─────────────────────────────────────────
const StatutBadge = ({ statut }: { statut: Rapport["statut"] }) => {
  const map = {
    valide: { label: "Validé ✓", cls: "bg-[#A4C639]/15 text-[#A4C639] border border-[#A4C639]/30", icon: <CheckCircle2 size={12} /> },
    refuse: { label: "Refusé ✗", cls: "bg-red-500/15 text-red-400 border border-red-500/30", icon: <XCircle size={12} /> },
    en_attente: { label: "En attente", cls: "bg-[#FDB813]/15 text-[#FDB813] border border-[#FDB813]/30", icon: <Clock size={12} /> },
  };
  const s = map[statut];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

const AppelStatutBadge = ({ statut }: { statut: Appel["statut"] }) => {
  const map = {
    effectue: { label: "Effectué", cls: "bg-[#A4C639]/15 text-[#A4C639]" },
    planifie: { label: "Planifié", cls: "bg-[#5E9FA3]/15 text-[#5E9FA3]" },
    manque: { label: "Manqué", cls: "bg-red-500/15 text-red-400" },
  };
  const s = map[statut];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
};

// ─── Main Page ────────────────────────────────────────────
export default function RapportsPage() {
  const [activeTab, setActiveTab] = useState<"rapports" | "appels">("rapports");
  const [expandedRapport, setExpandedRapport] = useState<string | null>(null);
  const [showNewAppel, setShowNewAppel] = useState(false);
  const [newAppel, setNewAppel] = useState({ directeur: "", ecole: "", date: "", heure: "", objet: "" });
  const [appels, setAppels] = useState<Appel[]>(MOCK_APPELS);

  const handleAddAppel = () => {
    if (!newAppel.directeur || !newAppel.ecole || !newAppel.date) return;
    const appel: Appel = {
      id: Date.now().toString(),
      directeur: newAppel.directeur,
      ecole: newAppel.ecole,
      date: newAppel.date,
      heure: newAppel.heure || "—",
      duree: "—",
      objet: newAppel.objet,
      statut: "planifie",
    };
    setAppels([appel, ...appels]);
    setNewAppel({ directeur: "", ecole: "", date: "", heure: "", objet: "" });
    setShowNewAppel(false);
  };

  const rapportStats = {
    total: MOCK_RAPPORTS.length,
    valides: MOCK_RAPPORTS.filter(r => r.statut === "valide").length,
    refuses: MOCK_RAPPORTS.filter(r => r.statut === "refuse").length,
    attente: MOCK_RAPPORTS.filter(r => r.statut === "en_attente").length,
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Rapports & Suivi</h1>
          <p className="text-slate-400 text-sm mt-1">Statut de vos rapports et appels avec les directeurs</p>
        </div>
        <button
          onClick={() => alert("Téléchargement de tous les rapports en PDF...")}
          className="flex items-center gap-2 bg-[#1F3C6D] hover:bg-[#A4C639] px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
        >
          <Download size={16} />
          Exporter tout
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Validés", value: rapportStats.valides, color: "text-[#A4C639]", bg: "bg-[#A4C639]/10" },
          { label: "En attente", value: rapportStats.attente, color: "text-[#FDB813]", bg: "bg-[#FDB813]/10" },
          { label: "Refusés", value: rapportStats.refuses, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit">
        {(["rapports", "appels"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-[#1F3C6D] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "rapports" ? <FileText size={15} /> : <Phone size={15} />}
            {tab === "rapports" ? "Mes Rapports" : "Suivi Appels"}
          </button>
        ))}
      </div>

      {/* ─── RAPPORTS TAB ─── */}
      <AnimatePresence mode="wait">
        {activeTab === "rapports" && (
          <motion.div key="rapports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {MOCK_RAPPORTS.map((rapport) => (
              <div key={rapport.id} className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedRapport(expandedRapport === rapport.id ? null : rapport.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{rapport.titre}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rapport.province} · {new Date(rapport.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StatutBadge statut={rapport.statut} />
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${expandedRapport === rapport.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedRapport === rapport.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-5 space-y-4">
                        {rapport.commentaire_coordinateur ? (
                          <div className={`p-4 rounded-xl ${rapport.statut === "refuse" ? "bg-red-500/10 border border-red-500/20" : "bg-[#A4C639]/10 border border-[#A4C639]/20"}`}>
                            <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${rapport.statut === "refuse" ? "text-red-400" : "text-[#A4C639]"}`}>
                              💬 Commentaire du Coordinateur
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">{rapport.commentaire_coordinateur}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-[#FDB813]/10 border border-[#FDB813]/20">
                            <p className="text-xs text-[#FDB813] font-bold flex items-center gap-2">
                              <Clock size={12} /> En attente de validation par le coordinateur…
                            </p>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => alert(`Téléchargement: ${rapport.titre}`)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm font-bold transition-all"
                          >
                            <Download size={14} /> Télécharger
                          </button>
                          {rapport.statut === "refuse" && (
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1F3C6D] hover:bg-[#A4C639] py-2.5 rounded-xl text-sm font-bold transition-all">
                              <Send size={14} /> Resoumettre
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── APPELS TAB ─── */}
        {activeTab === "appels" && (
          <motion.div key="appels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Add button */}
            <button
              onClick={() => setShowNewAppel(!showNewAppel)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-[#5E9FA3]/50 py-3 rounded-2xl text-slate-400 hover:text-[#5E9FA3] font-bold text-sm transition-all"
            >
              <Plus size={18} /> Planifier un nouvel appel
            </button>

            {/* New Appel Form */}
            <AnimatePresence>
              {showNewAppel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1E293B] rounded-2xl p-5 border border-[#5E9FA3]/20 space-y-4"
                >
                  <h3 className="font-black text-sm">Nouvel Appel</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { placeholder: "Nom du directeur", key: "directeur" },
                      { placeholder: "École", key: "ecole" },
                    ].map((field) => (
                      <input
                        key={field.key}
                        placeholder={field.placeholder}
                        value={newAppel[field.key as keyof typeof newAppel]}
                        onChange={e => setNewAppel({ ...newAppel, [field.key]: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#5E9FA3]"
                      />
                    ))}
                    <input type="date" value={newAppel.date} onChange={e => setNewAppel({ ...newAppel, date: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 focus:outline-none focus:border-[#5E9FA3]" />
                    <input type="time" value={newAppel.heure} onChange={e => setNewAppel({ ...newAppel, heure: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 focus:outline-none focus:border-[#5E9FA3]" />
                    <input placeholder="Objet de l'appel" value={newAppel.objet} onChange={e => setNewAppel({ ...newAppel, objet: e.target.value })}
                      className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#5E9FA3]" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddAppel} className="flex-1 bg-[#5E9FA3] hover:bg-[#A4C639] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Enregistrer
                    </button>
                    <button onClick={() => setShowNewAppel(false)} className="px-5 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold text-sm transition-all">
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Appels List */}
            {appels.map((appel, i) => (
              <motion.div key={appel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-[#1E293B] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5E9FA3]/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-[#5E9FA3]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{appel.directeur}</p>
                      <p className="text-xs text-slate-400">{appel.ecole}</p>
                    </div>
                  </div>
                  <AppelStatutBadge statut={appel.statut} />
                </div>
                <div className="bg-white/5 rounded-xl p-3 mb-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <MessageSquare size={11} className="inline mr-1.5 text-slate-500" />
                    {appel.objet}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>📅 {new Date(appel.date).toLocaleDateString("fr-FR")} à {appel.heure}</span>
                  {appel.duree !== "—" && <span>⏱ {appel.duree}</span>}
                  {appel.statut === "manque" && (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle size={12} /> Appel manqué
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
