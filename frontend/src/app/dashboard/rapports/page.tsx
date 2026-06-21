"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Plus,
  Filter,
  CheckCircle,
  BarChart,
  Trash2,
  Eye,
  X,
  AlertCircle,
  User,
  MapPin,
  Clock,
  Mic,
} from "lucide-react";
import { createClient } from '@/utils/supabase/client';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface Report {
  id: number;
  name: string;
  date: string;
  type: "PDF" | "CSV";
  size: string;
  status: "Prêt" | "En cours";
  school: string;
  trainer: string;
  province: string;
  summary: string;
  participants: number;
  duration: string;
}

// ────────────────────────────────────────────────────────────
// Données de démo — facilement remplaçables par Supabase
// ────────────────────────────────────────────────────────────
const INITIAL_REPORTS: Report[] = [
  {
    id: 1,
    name: "Rapport d'Impact — Province d'Ifrane",
    date: "12 Mai 2026",
    type: "PDF",
    size: "2.4 MB",
    status: "Prêt",
    school: "Lycée Al Farabi",
    trainer: "Youssef Alami",
    province: "Ifrane",
    summary:
      "Atelier Robotique & Arduino réalisé avec succès. 48 élèves ont participé sur une durée de 3 heures. Très bonne réception de la thématique côté enseignants.",
    participants: 48,
    duration: "3h00",
  },
  {
    id: 2,
    name: "Synthèse Hebdomadaire — Caravane Centre",
    date: "10 Mai 2026",
    type: "PDF",
    size: "1.8 MB",
    status: "Prêt",
    school: "Collège Ibn Sina",
    trainer: "Sara Kabbaj",
    province: "Midelt",
    summary:
      "Initiation Python niveau débutant. 36 élèves ont créé leur premier programme. Quelques difficultés avec l'environnement de développement — résolu en cours de session.",
    participants: 36,
    duration: "2h30",
  },
  {
    id: 3,
    name: "Statistiques Brutes — Mars/Avril",
    date: "01 Mai 2026",
    type: "CSV",
    size: "450 KB",
    status: "Prêt",
    school: "École Primaire Azzouia",
    trainer: "Amine Bennani",
    province: "Chefchaouen",
    summary:
      "Export des données brutes des ateliers Scratch. 52 élèves du cycle primaire ont découvert la logique de programmation via des jeux interactifs.",
    participants: 52,
    duration: "1h30",
  },
  {
    id: 4,
    name: "Rapport Annuel 2025 (Archive)",
    date: "15 Jan 2026",
    type: "PDF",
    size: "12.5 MB",
    status: "Prêt",
    school: "Lycée Ibn Toufail",
    trainer: "Youssef Alami",
    province: "Ifrane",
    summary:
      "Bilan annuel de la caravane 2025. 45 écoles visitées, 1824 élèves formés, 280h d'ateliers dispensés sur l'ensemble du territoire national.",
    participants: 1824,
    duration: "280h",
  },
];

// ────────────────────────────────────────────────────────────
// Composant principal
// ────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [filterType, setFilterType] = useState<"ALL" | "PDF" | "CSV">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const supabase = createClient();

  React.useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data && !error && data.length > 0) {
        setReports(data);
      }
    }
    loadReports();
  }, []);

  // Nouveau rapport
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newTrainer, setNewTrainer] = useState("Youssef Alami");
  const [newProvince, setNewProvince] = useState("Ifrane");
  const [newSummary, setNewSummary] = useState("");
  const [newParticipants, setNewParticipants] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newType, setNewType] = useState<"PDF" | "CSV">("PDF");
  const [isListening, setIsListening] = useState(false);

  const handleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Votre navigateur ne supporte pas la transcription vocale. Veuillez utiliser Google Chrome ou Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewSummary(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.start();
  };

  // ── Dérivés ──────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    const matchType = filterType === "ALL" || r.type === filterType;
    const matchSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trainer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // ── Actions ──────────────────────────────────────────────
  const handleDelete = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selectedReport?.id === id) setSelectedReport(null);
  };

  const handleDownload = (report: Report) => {
    // Génère un fichier texte simulant le rapport
    const content = `SMARTCARAVAN — ${report.name}
    
Date        : ${report.date}
Province    : ${report.province}
École       : ${report.school}
Formateur   : ${report.trainer}
Participants: ${report.participants}
Durée       : ${report.duration}

RÉSUMÉ :
${report.summary}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name}.${report.type.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSchool || !newSummary) return;
    const now = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const created: Report = {
      id: Date.now(),
      name: newName,
      date: now,
      type: newType,
      size: "< 1 MB",
      status: "Prêt",
      school: newSchool,
      trainer: newTrainer,
      province: newProvince,
      summary: newSummary,
      participants: Number(newParticipants) || 0,
      duration: newDuration || "—",
    };
    setReports([created, ...reports]);
    setShowCreateModal(false);
    // reset
    setNewName(""); setNewSchool(""); setNewSummary("");
    setNewParticipants(""); setNewDuration("");
  };

  // ── Rendu ────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B2B5B]">Rapports & Documents</h1>
          <p className="text-slate-500 font-medium mt-1">
            Générez, consultez et téléchargez vos bilans d'interventions terrain.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#0B2B5B] text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-[#0B2B5B]/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} />
          Nouveau Rapport
        </button>
      </div>

      {/* ─── KPIs ──────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center text-[#00B4A0]">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Rapports</p>
            <p className="text-2xl font-black text-[#0B2B5B]">{reports.length} rapports</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0B2B5B]/10 rounded-2xl flex items-center justify-center text-[#0B2B5B]">
            <Download size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants cumulés</p>
            <p className="text-2xl font-black text-[#0B2B5B]">
              {reports.reduce((s, r) => s + r.participants, 0).toLocaleString()} élèves
            </p>
          </div>
        </div>

        <div className="bg-[#0B2B5B] p-6 rounded-3xl shadow-xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#00B4A0]">
            <BarChart size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Provinces couvertes</p>
            <p className="text-2xl font-black">
              {[...new Set(reports.map((r) => r.province))].length} provinces
            </p>
          </div>
        </div>
      </div>

      {/* ─── Filtres & Recherche ───────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, école, formateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-[#0B2B5B] focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
        />
        <div className="flex gap-2">
          {(["ALL", "PDF", "CSV"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? "bg-[#0B2B5B] text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <Filter size={12} className="inline mr-1" />
              {t === "ALL" ? "Tous" : t}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Liste des Rapports ────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">École / Province</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Formateur</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <AlertCircle className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="text-slate-400 font-semibold text-sm">Aucun rapport trouvé.</p>
                  </td>
                </tr>
              )}
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        report.type === "PDF" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-[#0B2B5B] text-sm leading-tight">{report.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{report.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#00B4A0]" />
                      <span className="text-sm font-semibold text-slate-700">{report.school}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 pl-4">{report.province}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0B2B5B] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {report.trainer.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{report.trainer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      report.type === "PDF" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        title="Aperçu"
                        className="p-2 bg-[#0B2B5B]/5 text-[#0B2B5B] rounded-xl hover:bg-[#0B2B5B] hover:text-white transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(report)}
                        title="Télécharger"
                        className="p-2 bg-[#00B4A0]/10 text-[#00B4A0] rounded-xl hover:bg-[#00B4A0] hover:text-white transition-all"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        title="Supprimer"
                        className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal Aperçu ──────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              selectedReport.type === "PDF" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
            }`}>
              <FileText size={22} />
            </div>

            <h2 className="text-xl font-black text-[#0B2B5B] mb-1">{selectedReport.name}</h2>
            <p className="text-xs text-slate-400 font-semibold mb-6">{selectedReport.date}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <MapPin size={16} className="text-[#00B4A0]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">École</p>
                  <p className="text-sm font-bold text-[#0B2B5B]">{selectedReport.school}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <User size={16} className="text-[#0B2B5B]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">Formateur</p>
                  <p className="text-sm font-bold text-[#0B2B5B]">{selectedReport.trainer}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle size={16} className="text-[#00B4A0]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">Participants</p>
                  <p className="text-sm font-bold text-[#0B2B5B]">{selectedReport.participants} élèves</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={16} className="text-[#0B2B5B]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">Durée</p>
                  <p className="text-sm font-bold text-[#0B2B5B]">{selectedReport.duration}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Résumé de l'intervention</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedReport.summary}</p>
            </div>

            <button
              onClick={() => handleDownload(selectedReport)}
              className="w-full bg-[#0B2B5B] hover:bg-[#00B4A0] text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Télécharger le rapport ({selectedReport.type})
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal Création ────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-black text-[#0B2B5B] mb-1">Nouveau Rapport</h2>
            <p className="text-xs text-slate-400 font-semibold mb-6">Saisissez les informations du bilan d'intervention.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Titre du Rapport *</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
                  placeholder="Ex : Rapport Atelier Python - Lycée Al Farabi" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">École *</label>
                  <input required value={newSchool} onChange={e => setNewSchool(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
                    placeholder="Nom de l'établissement" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Province</label>
                  <select value={newProvince} onChange={e => setNewProvince(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]">
                    <option>Ifrane</option>
                    <option>Midelt</option>
                    <option>Chefchaouen</option>
                    <option>Khénifra</option>
                    <option>Sefrou</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Formateur</label>
                  <select value={newTrainer} onChange={e => setNewTrainer(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]">
                    <option>Youssef Alami</option>
                    <option>Sara Kabbaj</option>
                    <option>Amine Bennani</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as "PDF" | "CSV")}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]">
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Participants</label>
                  <input type="number" value={newParticipants} onChange={e => setNewParticipants(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
                    placeholder="ex : 42" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Durée</label>
                  <input value={newDuration} onChange={e => setNewDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
                    placeholder="ex : 3h00" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black text-slate-600">Résumé de l'intervention *</label>
                  <button
                    type="button"
                    onClick={handleSpeech}
                    className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
                      isListening 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-[#00B4A0]/10 text-[#00B4A0] hover:bg-[#00B4A0]/20"
                    }`}
                  >
                    <Mic size={10} />
                    {isListening ? "Écoute en cours..." : "Dicter le rapport"}
                  </button>
                </div>
                <textarea required rows={3} value={newSummary} onChange={e => setNewSummary(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B4A0]"
                  placeholder="Décrivez le déroulement de l'atelier, les résultats, les points marquants..." />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#0B2B5B] hover:bg-[#00B4A0] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Créer le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
