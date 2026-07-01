'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  BrainCircuit, TrendingUp, AlertTriangle, Target,
  MapPin, Layers, Activity, Zap, ChevronRight
} from 'lucide-react';

// URL centralisée via variable d'environnement — changez .env.local pour pointer vers la prod
const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';


const CLUSTER_COLORS: Record<string, string> = {
  'Zone a Fort Potentiel': '#10b981',
  'Zone a Risque Logistique': '#f59e0b',
  'Zone Saturee / Mature': '#6366f1',
};

const THEME_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalytiquePage() {
  const [kpis, setKpis] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [topThemes, setTopThemes] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clusters' | 'anomalies' | 'insights' | 'live'>('live');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [kpisRes, forecastRes, themesRes, clustersRes, anomaliesRes, corrRes, summaryRes] = await Promise.all([
          fetch(`${ML_API}/analytics/kpis`),
          fetch(`${ML_API}/analytics/forecast`),
          fetch(`${ML_API}/analytics/top-themes`),
          fetch(`${ML_API}/analytics/clusters`),
          fetch(`${ML_API}/insights/anomalies`),
          fetch(`${ML_API}/insights/correlations`),
          fetch(`${ML_API}/insights/ai-summary`),
        ]);

        const [k, f, t, cl, an, co, s] = await Promise.all([
          kpisRes.json(), forecastRes.json(), themesRes.json(),
          clustersRes.json(), anomaliesRes.json(), corrRes.json(), summaryRes.json()
        ]);

        if (k.success) setKpis(k.kpis);
        if (f.success) setForecast(f.forecast);
        if (t.success) setTopThemes(t.top_themes);
        if (cl.success) setClusters(cl.clusters);
        if (an.success) setAnomalies(an);
        if (co.success) setCorrelations(co.correlations.slice(0, 6));
        if (s.success) setAiSummary(s);
      } catch (e) {
        console.error('Erreur chargement analytics ML:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();

    async function fetchLive() {
      try {
        const res = await fetch(`${ML_API}/analytics/live`);
        const data = await res.json();
        if (data.success) {
          setLiveData(data);
        }
      } catch (e) {
        console.error('Erreur live data:', e);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 5000); // Rafraîchissement automatique toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-slate-600 font-medium">L'IA analyse les données historiques...</p>
        <p className="text-slate-400 text-sm">Random Forest · K-Means · Isolation Forest</p>
      </div>
    );
  }

  // Préparer données pour le radar des thèmes globaux
  const radarData = topThemes?.Global?.map((t: any) => ({
    theme: t.theme.split(' ')[0],
    engagement: t.engagement_moyen
  })) || [];

  // Données clusters pour PieChart
  const clusterCount: Record<string, number> = {};
  clusters.forEach(c => {
    clusterCount[c.cluster_nom] = (clusterCount[c.cluster_nom] || 0) + 1;
  });
  const clusterPieData = Object.entries(clusterCount).map(([name, value]) => ({ name, value }));

  const tabs = [
    { id: 'live', label: 'Temps Réel Supabase', icon: Activity },
    { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
    { id: 'clusters', label: 'K-Means Clusters', icon: Layers },
    { id: 'anomalies', label: 'Détection Anomalies', icon: AlertTriangle },
    { id: 'insights', label: 'Insights IA', icon: BrainCircuit },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B2B5B]">Analytique IA</h1>
        </div>
        <p className="text-slate-500 ml-13">
          Powered by <span className="font-semibold text-indigo-600">Random Forest · K-Means Clustering · Isolation Forest</span> — {kpis?.total_ateliers_historiques?.toLocaleString()} ateliers analysés
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Engagement Moyen', value: `${kpis.engagement_moyen}%`, sub: `Médiane: ${kpis.engagement_median}%`, color: 'from-emerald-500 to-teal-600', icon: Target },
            { label: 'Risque Élevé', value: `${kpis.pct_risque_eleve}%`, sub: `${kpis.pct_risque_faible}% faible`, color: 'from-amber-500 to-orange-600', icon: AlertTriangle },
            { label: 'Budget Moyen', value: `${kpis.budget_moyen_mad?.toLocaleString()} MAD`, sub: `Dist. moy: ${kpis.distance_moyenne_km} km`, color: 'from-blue-500 to-indigo-600', icon: Activity },
            { label: 'Meilleure Zone', value: kpis.zone_la_plus_performante, sub: kpis.theme_le_plus_performant, color: 'from-purple-500 to-violet-600', icon: Zap },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg`}
            >
              <kpi.icon size={20} className="mb-3 opacity-80" />
              <div className="text-2xl font-black mb-1">{kpi.value}</div>
              <div className="text-xs opacity-75">{kpi.label}</div>
              <div className="text-xs opacity-60 mt-1">{kpi.sub}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#0B2B5B] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Vue Globale */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Prévision engagement 6 mois */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Prévision Engagement — 6 prochains mois</h3>
            <p className="text-xs text-slate-400 mb-4">Régression temporelle basée sur les patterns saisonniers</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Engagement prédit']} />
                <Line type="monotone" dataKey="engagement_predit" stroke="#6366f1" strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Thèmes Global */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Performance des Thèmes</h3>
            <p className="text-xs text-slate-400 mb-4">Score d'engagement moyen par thématique (toutes zones)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topThemes?.Global || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="theme" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Engagement']} />
                <Bar dataKey="engagement_moyen" radius={[0, 6, 6, 0]}>
                  {topThemes?.Global?.map((_: any, i: number) => (
                    <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Thèmes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Radar de Performance</h3>
            <p className="text-xs text-slate-400 mb-4">Vue comparative des thèmes</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="theme" tick={{ fontSize: 11 }} />
                <Radar name="Engagement" dataKey="engagement" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparaison par zone */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Thèmes par Zone Géographique</h3>
            <p className="text-xs text-slate-400 mb-4">Engagement moyen selon le type de zone</p>
            <div className="space-y-3">
              {['Rurale', 'Mixte', 'Urbaine'].map(zone => {
                const zoneThemes = topThemes?.[zone] || [];
                const best = zoneThemes[0];
                const zoneColors: Record<string, string> = { Rurale: 'emerald', Mixte: 'amber', Urbaine: 'indigo' };
                const c = zoneColors[zone] || 'slate';
                return best ? (
                  <div key={zone} className={`flex items-center justify-between p-3 bg-${c}-50 rounded-xl`}>
                    <div>
                      <span className={`text-xs font-bold text-${c}-700 uppercase`}>{zone}</span>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{best.theme}</p>
                    </div>
                    <span className={`text-lg font-black text-${c}-600`}>{best.engagement_moyen}%</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: K-Means Clusters */}
      {activeTab === 'clusters' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Segmentation K-Means</h3>
            <p className="text-xs text-slate-400 mb-4">3 clusters identifiés parmi les provinces</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={clusterPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props: any) => `${((props.percent || 0) * 100).toFixed(0)}%`}>
                  {clusterPieData.map((entry, i) => (
                    <Cell key={i} fill={Object.values(CLUSTER_COLORS)[i] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {Object.entries(CLUSTER_COLORS).map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-4">Provinces par Cluster</h3>
            <div className="overflow-y-auto max-h-80 space-y-2 pr-1">
              {clusters.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CLUSTER_COLORS[c.cluster_nom] || '#94a3b8' }} />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.province}</p>
                      <p className="text-xs text-slate-400">{c.cluster_nom}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{c.engagement_moyen}%</p>
                    <p className="text-xs text-slate-400">{c.nb_ateliers} ateliers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Anomalies */}
      {activeTab === 'anomalies' && anomalies && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-bold text-amber-800">Isolation Forest — {anomalies.nb_anomalies_detectees} anomalies détectées</p>
              <p className="text-sm text-amber-700 mt-1">
                {anomalies.pct_anomalies}% des ateliers historiques présentent des performances statistiquement anormales.
                Ces signaux indiquent des interventions à analyser en priorité.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.anomalies?.map((a: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm ${a.severite === 'Critique' ? 'border-rose-200' : 'border-amber-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-800">{a.etablissement}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {a.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.is_real && (
                      <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full animate-pulse">
                        Live DB
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      a.severite === 'Critique' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>{a.severite}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${a.score_engagement}%` }} />
                  </div>
                  <span className="text-sm font-bold text-rose-600">{a.score_engagement}%</span>
                </div>
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">{a.alerte}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB: Insights IA */}
      {activeTab === 'insights' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Résumé narratif */}
          {aiSummary && (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit size={20} className="text-yellow-400" />
                <h3 className="font-bold text-lg">Résumé Analytique IA</h3>
              </div>
              <ul className="space-y-3">
                {aiSummary.resume_narratif?.map((insight: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-indigo-200">
                    <ChevronRight size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                    {insight}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-white/20 flex gap-4 text-xs text-indigo-300">
                <span>🧠 {aiSummary.meta?.modele}</span>
                <span>📊 {aiSummary.meta?.donnees}</span>
              </div>
            </div>
          )}

          {/* Corrélations de Pearson */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#0B2B5B] mb-1">Corrélations de Pearson</h3>
            <p className="text-xs text-slate-400 mb-4">Relations statistiques entre les variables du modèle</p>
            <div className="space-y-3">
              {correlations.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 w-48 truncate">{c.variable_a} ↔ {c.variable_b}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full ${c.correlation > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.abs(c.correlation) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${c.correlation > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {c.correlation > 0 ? '+' : ''}{c.correlation}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.force === 'Forte' ? 'bg-emerald-100 text-emerald-700' :
                    c.force === 'Moderee' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{c.force}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Temps Réel Supabase */}
      {activeTab === 'live' && liveData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Live Status Header */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
              <div>
                <p className="font-bold text-slate-800 text-sm">Base de données Supabase connectée</p>
                <p className="text-xs text-slate-400">Synchronisation automatique toutes les 5 secondes</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-500">
              Dernière MAJ : {new Date(liveData.last_updated).toLocaleTimeString()}
            </span>
          </div>

          {/* Live KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Activités Planifiées', value: liveData.summary.total_activities, sub: `${liveData.summary.activities_en_attente} en attente, ${liveData.summary.activities_terminees} terminées`, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { label: 'Formateurs Enregistrés', value: liveData.summary.total_trainers, sub: 'Table profiles', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Caravanes Déployées', value: liveData.summary.total_caravans, sub: 'Logistique active', color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Équipes Actives', value: liveData.summary.total_teams, sub: 'Table teams', color: 'text-rose-600 bg-rose-50 border-rose-100' },
            ].map((kpi, i) => (
              <div key={i} className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col justify-between`}>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-3xl font-black mt-2 ${kpi.color.split(' ')[0]}`}>{kpi.value}</p>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Live Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Workload Formateurs */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-[#0B2B5B] mb-1">Charge de Travail par Formateur</h3>
              <p className="text-xs text-slate-400 mb-4">Nombre d'ateliers assignés en temps réel</p>
              {liveData.charts.workload_formateurs.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
                  Aucun formateur assigné pour le moment.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={liveData.charts.workload_formateurs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="formateur" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="ateliers" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Répartition des statuts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-[#0B2B5B] mb-1">Statut des Activités</h3>
              <p className="text-xs text-slate-400 mb-4">Avancement des ateliers planifiés</p>
              {liveData.charts.status_repartition.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
                  Aucune activité enregistrée.
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-around gap-4">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={liveData.charts.status_repartition}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                        >
                          {liveData.charts.status_repartition.map((entry: any, i: number) => {
                            const colors: Record<string, string> = { pending: '#f59e0b', completed: '#10b981', canceled: '#ef4444' };
                            return <Cell key={i} fill={colors[entry.name] || '#94a3b8'} />;
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {liveData.charts.status_repartition.map((entry: any, i: number) => {
                      const labels: Record<string, string> = { pending: 'En attente', completed: 'Terminé', canceled: 'Annulé' };
                      const colors: Record<string, string> = { pending: 'bg-amber-500', completed: 'bg-emerald-500', canceled: 'bg-rose-500' };
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={`w-3 h-3 rounded-full ${colors[entry.name] || 'bg-slate-400'}`} />
                          <span className="font-bold text-slate-700">{labels[entry.name] || entry.name} :</span>
                          <span className="text-slate-500">{entry.value} ateliers</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Répartition des thèmes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-[#0B2B5B] mb-1">Thématiques les plus Planifiées</h3>
              <p className="text-xs text-slate-400 mb-4">Volume d'ateliers par sujet technique</p>
              {liveData.charts.themes_repartition.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
                  Aucun atelier planifié.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={liveData.charts.themes_repartition} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="theme" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Rôles des collaborateurs */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-[#0B2B5B] mb-1">Rôles de l'Équipe</h3>
              <p className="text-xs text-slate-400 mb-4">Profils enregistrés dans la table profiles</p>
              {liveData.charts.roles_formateurs.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
                  Aucun formateur trouvé.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={liveData.charts.roles_formateurs}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={(props: any) => `${(props.role || '').split(' ')[0]} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {liveData.charts.roles_formateurs.map((entry: any, i: number) => (
                        <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} personnes`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
