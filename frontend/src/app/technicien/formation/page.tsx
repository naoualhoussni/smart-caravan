"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, Filter, CheckCircle2, X,
  Sparkles, School, MapPin, ChevronDown, Download, Upload
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface Formateur {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  province: string;
  specialite: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  score: number; // score d'adéquation (0-100)
  selectionne?: boolean;
  ecoleAssignee?: string;
}

interface Ecole {
  id: string;
  nom: string;
  province: string;
  nbEleves: number;
  niveaux: string[];
  formateurAssigne?: string;
}

// ─── Mock Data ───────────────────────────────────────────
const PROVINCES = ["Tinghir", "Ouarzazate", "Zagora", "Errachidia", "Midelt", "Azilal"];
const SPECIALITES = ["IoT & Robotique", "Programmation", "Scratch", "Comportement conceptuel"];
const NIVEAUX_ECOLE = ["Primaire", "Collège", "Lycée"];

const generateFormateurs = (): Formateur[] => {
  const noms = ["Alami", "Bensalem", "Chraibi", "Dahbi", "El Fassi", "Fathi", "Guessous", "Hamid", "Idrissi", "Jalil", "Kadiri", "Lahbabi", "Mansouri", "Naciri", "Oufkir", "Qanit", "Rahmani", "Saidi", "Tahiri", "Umayyad"];
  const prenoms = ["Ahmed", "Fatima", "Youssef", "Khadija", "Mohammed", "Asmaa", "Khalid", "Zineb", "Rachid", "Meryem", "Omar", "Laila", "Hassan", "Sara", "Amine", "Houda", "Bilal", "Nadia", "Karim", "Soumia"];
  const result: Formateur[] = [];
  for (let i = 0; i < 50; i++) { // On génère 50 pour la démo (2000 en prod)
    result.push({
      id: `F${String(i + 1).padStart(4, "0")}`,
      nom: noms[i % noms.length],
      prenom: prenoms[i % prenoms.length],
      cin: `A${Math.floor(100000 + Math.random() * 900000)}`,
      email: `${prenoms[i % prenoms.length].toLowerCase()}.${noms[i % noms.length].toLowerCase()}@gmail.com`,
      telephone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
      province: PROVINCES[i % PROVINCES.length],
      specialite: SPECIALITES[i % SPECIALITES.length],
      niveau: (["Débutant", "Intermédiaire", "Avancé"] as const)[i % 3],
      score: Math.floor(60 + Math.random() * 40),
    });
  }
  return result;
};

const MOCK_ECOLES: Ecole[] = [
  { id: "E001", nom: "Lycée Bamou", province: "Tinghir", nbEleves: 420, niveaux: ["Lycée"] },
  { id: "E002", nom: "Collège Ibn Sina", province: "Tinghir", nbEleves: 280, niveaux: ["Collège"] },
  { id: "E003", nom: "Lycée Hassan II", province: "Zagora", nbEleves: 350, niveaux: ["Lycée"] },
  { id: "E004", nom: "Lycée Moulay Ali Cherif", province: "Midelt", nbEleves: 310, niveaux: ["Lycée"] },
  { id: "E005", nom: "Collège Al Massira", province: "Zagora", nbEleves: 195, niveaux: ["Collège"] },
];

// ─── ALGORITHME D'AUTO-SÉLECTION ─────────────────────────
// Critères pondérés:
//   1. Proximité géographique (même province) → +40 pts
//   2. Score individuel du formateur         → +0 à 40 pts
//   3. Spécialité adaptée (non Scratch pour lycée) → +20 pts
function autoSelectFormateurs(formateurs: Formateur[], ecoles: Ecole[]): { ecole: Ecole; formateur: Formateur }[] {
  const assignments: { ecole: Ecole; formateur: Formateur }[] = [];
  const used = new Set<string>();

  for (const ecole of ecoles) {
    const scored = formateurs
      .filter(f => !used.has(f.id))
      .map(f => {
        let score = f.score * 0.4; // 0-40 pts
        if (f.province === ecole.province) score += 40; // même province
        const isLycee = ecole.niveaux.includes("Lycée");
        if (isLycee && (f.specialite === "IoT & Robotique" || f.specialite === "Programmation")) score += 20;
        if (!isLycee && f.specialite === "Scratch") score += 20;
        return { formateur: f, totalScore: score };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    if (scored.length > 0) {
      assignments.push({ ecole, formateur: scored[0].formateur });
      used.add(scored[0].formateur.id);
    }
  }
  return assignments;
}

// ─── Main Page ────────────────────────────────────────────
export default function FormationPage() {
  const [activeTab, setActiveTab] = useState<"inscription" | "selection">("inscription");
  const [formateurs] = useState<Formateur[]>(generateFormateurs());
  const [ecoles] = useState<Ecole[]>(MOCK_ECOLES);
  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState("Tous");
  const [filterSpecialite, setFilterSpecialite] = useState("Tous");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [autoResults, setAutoResults] = useState<{ ecole: Ecole; formateur: Formateur }[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormateur, setNewFormateur] = useState({ nom: "", prenom: "", cin: "", email: "", telephone: "", province: PROVINCES[0], specialite: SPECIALITES[0] });

  const filteredFormateurs = useMemo(() => {
    return formateurs.filter(f => {
      const matchSearch = !search || `${f.nom} ${f.prenom} ${f.cin}`.toLowerCase().includes(search.toLowerCase());
      const matchProv = filterProvince === "Tous" || f.province === filterProvince;
      const matchSpec = filterSpecialite === "Tous" || f.specialite === filterSpecialite;
      const matchNiv = filterNiveau === "Tous" || f.niveau === filterNiveau;
      return matchSearch && matchProv && matchSpec && matchNiv;
    });
  }, [formateurs, search, filterProvince, filterSpecialite, filterNiveau]);

  const handleAutoSelect = () => {
    const results = autoSelectFormateurs(filteredFormateurs, ecoles);
    setAutoResults(results);
  };

  const NiveauBadge = ({ niveau }: { niveau: string }) => {
    const map: Record<string, string> = { "Débutant": "bg-[#FDB813]/10 text-[#FDB813]", "Intermédiaire": "bg-[#5E9FA3]/10 text-[#5E9FA3]", "Avancé": "bg-[#A4C639]/10 text-[#A4C639]" };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[niveau] || "bg-white/5 text-slate-400"}`}>{niveau}</span>;
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Gestion de la Formation</h1>
          <p className="text-slate-400 text-sm mt-1">
            Inscription des formateurs et sélection intelligente par école
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#A4C639]/10 border border-[#A4C639]/20 px-4 py-2.5 rounded-xl text-sm font-bold text-[#A4C639]">
            <Users size={15} className="inline mr-1.5" />
            {formateurs.length.toLocaleString()} formateurs (démo : 50 / prod : 2000)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit">
        {([{ key: "inscription", label: "Inscription" }, { key: "selection", label: "Sélection Auto IA" }] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? "bg-[#1F3C6D] text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            {tab.key === "selection" && <Sparkles size={14} className="text-[#FDB813]" />}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── ONGLET INSCRIPTION ─── */}
        {activeTab === "inscription" && (
          <motion.div key="inscription" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input placeholder="Rechercher par nom, prénom ou CIN…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#5E9FA3]" />
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-[#1F3C6D] hover:bg-[#A4C639] px-5 py-3 rounded-xl font-bold text-sm transition-all shrink-0">
                <Plus size={16} /> Ajouter formateur
              </button>
              <button onClick={() => alert("Import CSV de 2000 formateurs...")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl font-bold text-sm transition-all shrink-0">
                <Upload size={16} /> Import CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Province", value: filterProvince, onChange: setFilterProvince, options: ["Tous", ...PROVINCES] },
                { label: "Spécialité", value: filterSpecialite, onChange: setFilterSpecialite, options: ["Tous", ...SPECIALITES] },
                { label: "Niveau", value: filterNiveau, onChange: setFilterNiveau, options: ["Tous", "Débutant", "Intermédiaire", "Avancé"] },
              ].map(f => (
                <div key={f.label} className="relative">
                  <Filter size={12} className="absolute left-3 top-3.5 text-slate-500" />
                  <select value={f.value} onChange={e => f.onChange(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-[#5E9FA3]">
                    {f.options.map(o => <option key={o} value={o}>{o === "Tous" ? `${f.label}: Tous` : o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-3.5 text-slate-500 pointer-events-none" />
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-3 py-2.5 bg-white/5 rounded-xl">
                {filteredFormateurs.length} résultat{filteredFormateurs.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1E293B] rounded-2xl p-5 border border-[#5E9FA3]/20 space-y-4">
                  <h3 className="font-black">Nouveau Formateur</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "prenom", label: "Prénom" },
                      { key: "nom", label: "Nom" },
                      { key: "cin", label: "CIN" },
                      { key: "email", label: "Email" },
                      { key: "telephone", label: "Téléphone" },
                    ].map(field => (
                      <input key={field.key} placeholder={field.label} value={newFormateur[field.key as keyof typeof newFormateur]}
                        onChange={e => setNewFormateur({ ...newFormateur, [field.key]: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#5E9FA3]" />
                    ))}
                    <select value={newFormateur.province} onChange={e => setNewFormateur({ ...newFormateur, province: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#5E9FA3]">
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={newFormateur.specialite} onChange={e => setNewFormateur({ ...newFormateur, specialite: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#5E9FA3]">
                      {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowAddForm(false); alert("Formateur ajouté avec succès !"); }}
                      className="flex-1 bg-[#A4C639] hover:bg-[#1F3C6D] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Enregistrer
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="px-5 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold text-sm transition-all">
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Formateur</th>
                      <th className="text-left px-5 py-3 hidden sm:table-cell">CIN</th>
                      <th className="text-left px-5 py-3 hidden md:table-cell">Province</th>
                      <th className="text-left px-5 py-3 hidden lg:table-cell">Spécialité</th>
                      <th className="text-left px-5 py-3">Niveau</th>
                      <th className="text-right px-5 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredFormateurs.slice(0, 20).map((f) => (
                      <tr key={f.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold">{f.prenom} {f.nom}</p>
                            <p className="text-xs text-slate-500">{f.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell text-slate-400 font-mono text-xs">{f.cin}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="flex items-center gap-1 text-xs text-slate-300">
                            <MapPin size={11} className="text-slate-500" /> {f.province}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-300">{f.specialite}</td>
                        <td className="px-5 py-4"><NiveauBadge niveau={f.niveau} /></td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-black text-sm ${f.score >= 80 ? "text-[#A4C639]" : f.score >= 65 ? "text-[#5E9FA3]" : "text-[#FDB813]"}`}>
                            {f.score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFormateurs.length > 20 && (
                  <div className="text-center py-4 text-xs text-slate-500 border-t border-white/5">
                    Affichage de 20 / {filteredFormateurs.length} formateurs. Utilisez les filtres pour affiner.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── ONGLET SÉLECTION AUTO IA ─── */}
        {activeTab === "selection" && (
          <motion.div key="selection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Algo Explanation */}
            <div className="bg-gradient-to-r from-[#1F3C6D]/20 to-[#5E9FA3]/10 border border-[#5E9FA3]/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FDB813]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="text-[#FDB813]" size={24} />
                </div>
                <div>
                  <h2 className="font-black text-lg mb-2">Algorithme de Sélection Intelligente</h2>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    L&apos;algorithme sélectionne automatiquement le meilleur formateur pour chaque école selon 3 critères pondérés :
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { label: "Proximité provinciale", desc: "+40 pts si même province", color: "text-[#A4C639]" },
                      { label: "Score individuel", desc: "Score de 0 à 40 pts", color: "text-[#5E9FA3]" },
                      { label: "Adéquation spécialité", desc: "+20 pts selon le niveau de l'école", color: "text-[#FDB813]" },
                    ].map((c, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3">
                        <p className={`font-bold text-xs ${c.color}`}>{c.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <button onClick={handleAutoSelect}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#1F3C6D] to-[#5E9FA3] hover:from-[#A4C639] hover:to-[#5E9FA3] py-4 rounded-2xl font-black text-lg shadow-xl shadow-[#1F3C6D]/30 transition-all">
              <Sparkles size={22} />
              Lancer la Sélection Automatique ({ecoles.length} écoles)
            </button>

            {/* Results */}
            {autoResults && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black">
                    Formateurs Finaux <span className="text-[#A4C639]">({autoResults.length} assignés)</span>
                  </h2>
                  <button onClick={() => alert("Export de la liste des formateurs sélectionnés...")}
                    className="flex items-center gap-2 bg-[#A4C639]/10 border border-[#A4C639]/20 text-[#A4C639] hover:bg-[#A4C639] hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
                    <Download size={14} /> Exporter
                  </button>
                </div>
                {autoResults.map(({ ecole, formateur }, i) => (
                  <motion.div key={ecole.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-[#1E293B] rounded-2xl p-5 border border-[#A4C639]/20 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1F3C6D]/20 flex items-center justify-center shrink-0">
                        <School size={18} className="text-[#5E9FA3]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{ecole.nom}</p>
                        <p className="text-xs text-slate-400">{ecole.province} · {ecole.niveaux.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#A4C639]">
                      <span className="text-slate-500 text-lg">→</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FDB813]/20 to-[#A4C639]/20 flex items-center justify-center shrink-0 font-black text-sm text-[#FDB813]">
                        {formateur.prenom[0]}{formateur.nom[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{formateur.prenom} {formateur.nom}</p>
                        <p className="text-xs text-slate-400">{formateur.specialite} · {formateur.province}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${formateur.score >= 80 ? "text-[#A4C639]" : "text-[#5E9FA3]"}`}>
                        Score: {formateur.score}%
                      </span>
                      <CheckCircle2 size={18} className="text-[#A4C639]" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
