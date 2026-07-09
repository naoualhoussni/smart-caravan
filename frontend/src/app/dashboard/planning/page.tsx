'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

const supabase = createClient();

interface Activity {
  id: string;
  school_name: string;
  province?: string;
  date: string;
  time_slot: string;
  trainer_name: string;
  theme: string;
  status: 'pending' | 'completed' | 'canceled';
}

export default function PlanningPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchool, setNewSchool] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 - 12:00');
  const [newTrainer, setNewTrainer] = useState('');
  const [newTheme, setNewTheme] = useState('Robotique & Arduino');
  
  // Nouveaux états pour le Machine Learning
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [dbTrainers, setDbTrainers] = useState<Array<{ full_name: string; role: string }>>([]);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
      if (data && !error && data.length > 0) {
        setActivities(data);
      }
      
      const { data: trainersData, error: trainersError } = await supabase.from('profiles').select('full_name, role');
      if (trainersData && !trainersError) {
        const validTrainers = trainersData.filter((p: any) => p.full_name);
        setDbTrainers(validTrainers);
      }
    }
    loadData();
  }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool || !newDate || !newTrainer) return;

    const newAct: Activity = {
      id: Date.now().toString(),
      school_name: newSchool,
      date: newDate,
      time_slot: newTime,
      trainer_name: newTrainer,
      theme: newTheme,
      status: 'pending',
    };

    const { error } = await supabase.from('activities').insert([
      {
        school_name: newSchool,
        date: newDate,
        time_slot: newTime,
        trainer_name: newTrainer,
        theme: newTheme,
        status: 'pending',
        type: 'Atelier'
      }
    ]);
    
    if (!error) {
      setActivities([newAct, ...activities]);
      setShowAddModal(false);
      setNewSchool('');
      setNewDate('');
    }
  };
  const handleSmartGenerate = async () => {
    setIsGenerating(true);
    // Utilise la variable d'env pour éviter l'URL codée en dur (facilite le déploiement)
    const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${ML_API}/recommend?limit=5`);
      const data = await response.json();
      if (data.success) {
        setPredictions(data.recommendations);
      }
    } catch (error) {
      console.error("Erreur ML:", error);
      alert("Erreur de connexion a l'API IA. Le serveur FastAPI tourne-t-il sur le port 8000 ?");
    } finally {
      setIsGenerating(false);
      setIsSmartMode(true);
    }
  };

  // Dictionnaire statique de vrais établissements par province pour le MVP
  const REAL_SCHOOLS_MAP: Record<string, string[]> = {
    "Tinghir": ["Lycée Bamou", "Lycée Salah Eddine Al Ayoubi", "Lycée Ibn Sina"],
    "Azilal": ["Lycée Ouzoud", "Lycée Technique Azilal", "Lycée Demnate"],
    "Casablanca": ["Lycée Lyautey", "Lycée Moulay Abdellah", "Lycée Al Khawarizmi", "Lycée Mohammed V"],
    "Rabat": ["Lycée Moulay Youssef", "Lycée Descartes", "Lycée Hassan II", "Lycée Lalla Aicha"],
    "Marrakech": ["Lycée Victor Hugo", "Lycée Ibn Abbad", "Lycée Hassan II"],
    "Beni Mellal": ["Lycée Ibn Sina", "Lycée Hassan II", "Lycée Technique"],
    "Kenitra": ["Lycée Ibn Tahir", "Lycée Abdelmalek Essaadi", "Lycée Mohammed V"],
    "Taroudant": ["Lycée Mohammed V", "Lycée Ibn Soulaiman Roudani", "Lycée technique"]
  };

  const handleAcceptRecommendation = async (rec: any) => {
    // 1. Calcul de la date de la semaine prochaine (Samedi prochain)
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
    const dateStr = nextSaturday.toISOString().split('T')[0];

    const schoolName = rec.nom_etablissement || rec.province;
    
    // Algorithme d'affectation intelligent :
    // 1. Filtrer les formateurs par spécialité (rôle) en fonction du thème
    let qualifiedTrainers = dbTrainers.filter(t => {
      const role = t.role ? t.role.toLowerCase() : "";
      const themeLower = rec.theme.toLowerCase();
      
      if (themeLower.includes("robotique") || themeLower.includes("python") || themeLower.includes("intelligence")) {
        return role.includes("it") || role.includes("technique") || role.includes("superviseur") || role.includes("informatique");
      } else if (themeLower.includes("scratch") || themeLower.includes("jeux")) {
        return role.includes("it") || role.includes("skills") || role.includes("superviseur");
      }
      return true;
    });

    if (qualifiedTrainers.length === 0) {
      qualifiedTrainers = dbTrainers;
    }

    // 2. Équilibrer la charge de travail (Workload Balancing)
    // On compte le nombre d'ateliers 'pending' déjà assignés à chaque formateur
    const workloadMap: Record<string, number> = {};
    activities.forEach(act => {
      if (act.status === 'pending') {
        workloadMap[act.trainer_name] = (workloadMap[act.trainer_name] || 0) + 1;
      }
    });

    // 3. Assigner au formateur disponible le moins chargé
    let assignedTeam = "Admin SmartCaravan";
    if (qualifiedTrainers.length > 0) {
      qualifiedTrainers.sort((a, b) => {
        const loadA = workloadMap[a.full_name] || 0;
        const loadB = workloadMap[b.full_name] || 0;
        return loadA - loadB;
      });
      assignedTeam = qualifiedTrainers[0].full_name;
    }

    const newAct: Activity = {
      id: Date.now().toString(),
      school_name: schoolName,
      province: rec.province,
      date: dateStr,
      time_slot: '09:00 - 12:00',
      trainer_name: assignedTeam,
      theme: rec.theme,
      status: 'pending',
    };

    const { error } = await supabase.from('activities').insert([
      {
        school_name: newAct.school_name,
        date: newAct.date,
        time_slot: newAct.time_slot,
        trainer_name: newAct.trainer_name,
        theme: newAct.theme,
        status: 'pending',
        type: 'Atelier'
      }
    ]);
    
    if (!error) {
      setActivities([newAct, ...activities]);
      alert(`✅ L'intervention à ${rec.province} a été ajoutée au planning avec succès ! L'équipe recevra une notification sur son téléphone.`);
      setIsSmartMode(false); // Retour au planning normal pour voir l'ajout
    } else {
      alert("Erreur lors de l'ajout : " + error.message);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B2B5B]">Planning des Interventions</h1>
          <p className="text-slate-500 mt-2">Gérez et assignez les ateliers de formation sur le terrain</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={isSmartMode ? () => setIsSmartMode(false) : handleSmartGenerate}
            disabled={isGenerating}
            className={`font-bold py-3 px-6 rounded-xl transition duration-300 flex items-center gap-2 shadow-lg ${
              isSmartMode 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/30'
            }`}
          >
            {isGenerating ? (
              <><span className="animate-spin">🔄</span> Analyse des données...</>
            ) : isSmartMode ? (
              <><Navigation size={20} /> Retour au Planning Manuel</>
            ) : (
              <><BrainCircuit size={20} /> Smart Planning IA</>
            )}
          </button>
          
          {!isSmartMode && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#00B4A0] hover:bg-[#009685] text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <span>➕</span> Programmer
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSmartMode ? (
          <motion.div 
            key="smart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-yellow-400" size={28} />
                <h2 className="text-2xl font-black">Moteur d'Allocation Logistique Prédictive</h2>
              </div>
              <p className="text-indigo-200 text-lg max-w-3xl leading-relaxed">
                Notre modèle d'apprentissage automatique a analysé <span className="font-bold text-white">5,000 ateliers historiques</span>, les conditions météorologiques et les performances des formateurs pour vous suggérer les meilleurs déploiements du mois.
              </p>
            </div>

            <h3 className="text-xl font-bold text-[#0B2B5B] mt-8 mb-4">Recommandations pour la semaine prochaine</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {predictions.map((pred, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      #{i+1} Suggestion IA
                    </span>
                    {pred.risk === "Faible" ? <CheckCircle2 className="text-emerald-500 shrink-0" size={22} /> : <AlertTriangle className="text-amber-500 shrink-0" size={22} />}
                  </div>

                  {/* Etablissement */}
                  <h4 className="text-lg font-black text-[#0B2B5B] leading-tight">{pred.nom_etablissement}</h4>
                  <div className="flex items-center gap-2 mt-1 mb-1">
                    <span className="text-slate-400 text-xs">📍</span>
                    <span className="text-slate-500 text-sm font-medium">{pred.province}</span>
                    <span className="text-slate-300">·</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{pred.type_etablissement}</span>
                  </div>
                  <p className="text-[#00B4A0] font-bold text-sm mb-4">{pred.theme}</p>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Engagement prédit</span>
                        <span className="font-bold text-emerald-600">{pred.engagement}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all" style={{ width: `${pred.engagement}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Risque logistique</span>
                      <span className={`font-bold ${pred.risk === 'Faible' ? 'text-emerald-600' : pred.risk === 'Moyen' ? 'text-amber-600' : 'text-rose-600'}`}>{pred.risk}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Élèves concernés</span>
                      <span className="font-bold text-slate-700">{pred.nb_eleves?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Dernière visite</span>
                      <span className="font-bold text-slate-700">{pred.mois_depuis_derniere_visite} mois</span>
                    </div>
                  </div>

                  {/* Raisons IA */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 flex-1">
                    <p className="text-xs font-bold text-slate-600 mb-2">Pourquoi l'IA recommande :</p>
                    <ul className="space-y-1">
                      {pred.raisons?.slice(0, 3).map((r: string, j: number) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                          <span className="text-indigo-400 mt-0.5 shrink-0">▸</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleAcceptRecommendation(pred)}
                    className="w-full bg-[#0B2B5B] hover:bg-indigo-900 text-white font-bold py-2.5 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-sm mt-auto"
                  >
                    <CheckCircle2 size={16} /> Convertir en Atelier
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Tableau classique */}
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[#0B2B5B] font-bold text-sm">
                  <th className="p-4 pl-6">École / Établissement</th>
                  <th className="p-4">Province</th>
                  <th className="p-4">Date & Heure</th>
                  <th className="p-4">Thème</th>
                  <th className="p-4">Formateur Assigné</th>
                  <th className="p-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-white">
                        {act.school_name || (act as any).nom_ecole || (act as any).school || (act as any).name || <span className="text-slate-400 italic text-sm">Non renseigné</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      {act.province ? (
                        <span className="flex items-center gap-1 text-slate-300 text-sm">
                          <span>📍</span> {act.province}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm italic">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{act.date}</div>
                      <div className="text-xs text-slate-400">{act.time_slot}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {act.theme}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-[#0B2B5B]">
                          {act.trainer_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{act.trainer_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          act.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : act.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {act.status === 'completed'
                          ? 'Terminé'
                          : act.status === 'pending'
                          ? 'Planifié'
                          : 'Annulé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activities.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                Aucune intervention programmée pour le moment.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'ajout (inchangé) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0B2B5B]">Nouvelle Intervention</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'Établissement</label>
                <input type="text" required placeholder="Lycée Ibn Toufail" value={newSchool} onChange={(e) => setNewSchool(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2B5B] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2B5B] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Créneau horaire</label>
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2B5B] outline-none">
                    <option value="09:00 - 12:00">Matin (09:00 - 12:00)</option>
                    <option value="14:00 - 17:00">Après-midi (14:00 - 17:00)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Thématique</label>
                <select value={newTheme} onChange={(e) => setNewTheme(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2B5B] outline-none">
                  <option value="Robotique & Arduino">Robotique & Arduino</option>
                  <option value="Initiation Python">Initiation Python</option>
                  <option value="Création de Jeux Scratch">Création de Jeux Scratch</option>
                  <option value="Intelligence Artificielle MVP">Intelligence Artificielle MVP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Formateur Assigné</label>
                <input type="text" required placeholder="Nom du formateur" value={newTrainer} onChange={(e) => setNewTrainer(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2B5B] outline-none" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition">Annuler</button>
                <button type="submit" className="flex-1 bg-[#0B2B5B] hover:bg-[#081b3b] text-white font-bold py-2.5 rounded-xl transition">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
