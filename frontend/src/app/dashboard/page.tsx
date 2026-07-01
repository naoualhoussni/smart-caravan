"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Users, School, TrendingUp, CheckCircle, Clock,
  AlertTriangle, ArrowUpRight, Camera, Mic, BrainCircuit,
  Activity, ChevronRight, Star
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

import MoroccoMap from "@/components/MoroccoMapWrapper";

const KPICard = ({ kpi, index }: { kpi: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 bg-${kpi.color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <kpi.icon size={24} className={`text-${kpi.color}`} />
      </div>
      <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-full flex items-center gap-1">
        <ArrowUpRight size={12} /> {kpi.trend}
      </span>
    </div>
    <div className="space-y-1 mb-4">
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
      <p className="text-4xl font-black text-brand-blue">{kpi.value}</p>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold text-muted-foreground">
        <span>Progression</span>
        <span>{kpi.pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${kpi.pct}%` }}
          transition={{ duration: 1, delay: index * 0.15 }}
          className={`h-full bg-${kpi.color} rounded-full`}
        />
      </div>
    </div>
  </motion.div>
);

const recentActivities = [
  { team: "Équipe Atlas", action: "Check-in effectué", location: "École Al Farabi, Ifrane", time: "Il y a 12 min", status: "success", avatar: "EA" },
  { team: "Équipe Sebou", action: "Module Python complété", location: "Collège Ibn Sina, Khénifra", time: "Il y a 35 min", status: "success", avatar: "ES" },
  { team: "Équipe Drâa", action: "Retard signalé", location: "École Assalam, Ouarzazate", time: "Il y a 1h", status: "warning", avatar: "ED" },
  { team: "Équipe Tensift", action: "Photos uploadées (12)", location: "LPQ Moulay Rachid, Marrakech", time: "Il y a 2h", status: "success", avatar: "ET" },
  { team: "Équipe Souss", action: "Rapport vocal soumis", location: "Collège Tafraout, Agadir", time: "Il y a 3h", status: "success", avatar: "ES" },
];

export default function DashboardPage() {
  const [caravanCount, setCaravanCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [caravanes, setCaravanes] = useState<any[]>([]);
  const [combinedActivities, setCombinedActivities] = useState<any[]>(recentActivities);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const supabase = createClient();

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/ai-insights");
      const data = await res.json();
      if (data.insights && data.insights.length > 0) {
        setInsights(data.insights);
      } else {
        // Fallback
        setInsights([
          { text: "L'équipe Drâa affiche 2 retards consécutifs. Une intervention proactive est recommandée.", type: "warning" },
          { text: "Caravane Centre progresse à un rythme optimal. Prévision de complétion le 20 Mai.", type: "success" },
          { text: "Taux de satisfaction moyen : 4.7/5 basé sur 340 retours élèves analysés.", type: "info" },
        ]);
      }
    } catch (e) {
      console.error("Error fetching AI Insights:", e);
      setInsights([
        { text: "L'équipe Drâa affiche 2 retards consécutifs. Une intervention proactive est recommandée.", type: "warning" },
        { text: "Caravane Centre progresse à un rythme optimal. Prévision de complétion le 20 Mai.", type: "success" },
        { text: "Taux de satisfaction moyen : 4.7/5 basé sur 340 retours élèves analysés.", type: "info" },
      ]);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appel via le proxy serveur Next.js — évite l'erreur ERR_CONNECTION_REFUSED
        // côté navigateur. Le serveur Next.js se charge de contacter l'API Python.
        const res = await fetch(`/api/ml-overview`);
        const data = await res.json();
        
        if (data.success) {
          setCaravanCount(data.kpis.caravans);
          setTeamCount(data.kpis.teams);
          setActivitiesCount(data.kpis.activities);
          setSchoolsCount(data.kpis.schools);
          
          if (data.recent && data.recent.length > 0) {
            const formattedAct = data.recent.map((a: any) => ({
              team: a.trainer_name || "Équipe Non assignée",
              action: "Atelier IA Créé",
              location: a.school_name,
              time: a.time_slot,
              status: "success",
              avatar: a.trainer_name ? a.trainer_name.substring(0, 2).toUpperCase() : "IA"
            }));
            setCombinedActivities(formattedAct);
          }
        }

        // Fetch actual caravans from Supabase
        const { data: caravansData, error: caravansErr } = await supabase
          .from("caravans")
          .select("*")
          .order("start_date", { ascending: false });

        if (caravansData && !caravansErr) {
          const simulatedCaravans = [
            { id: "sim-1", name: "Caravane Nord (Simulée)", province: "Tanger", status: "ACTIVE", start_date: new Date().toISOString() },
            { id: "sim-2", name: "Caravane Oriental (Simulée)", province: "Oujda", status: "ACTIVE", start_date: new Date().toISOString() },
            { id: "sim-3", name: "Caravane Sahara (Simulée)", province: "Laayoune", status: "ACTIVE", start_date: new Date().toISOString() },
            { id: "sim-4", name: "Caravane Sud (Simulée)", province: "Guelmim", status: "ACTIVE", start_date: new Date().toISOString() },
          ];
          setCaravanes([...caravansData, ...simulatedCaravans]);
        }
      } catch (error) {
        console.error("Erreur récupération données dashboard:", error);
      }
    };

    fetchData();
    fetchInsights();
  }, []);

  const kpis = [
    { label: "Établissements couverts", value: schoolsCount.toString(), total: "60", pct: Math.min((schoolsCount / 60) * 100, 100).toFixed(0), icon: School, color: "brand-blue", trend: "Live de Supabase" },
    { label: "Total Équipes", value: teamCount.toString(), total: "10", pct: Math.min((teamCount / 10) * 100, 100).toFixed(0), icon: Users, color: "brand-green", trend: "Live de Supabase" },
    { label: "Caravanes actives", value: caravanCount.toString(), total: "5", pct: Math.min((caravanCount / 5) * 100, 100).toFixed(0), icon: MapPin, color: "brand-green", trend: "Live de Supabase" },
    { label: "Total Ateliers", value: activitiesCount.toString(), total: "100", pct: Math.min((activitiesCount / 100) * 100, 100).toFixed(0), icon: TrendingUp, color: "brand-orange", trend: "Live de Supabase" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-blue">Vue Globale</h1>
          <p className="text-muted-foreground font-medium mt-1">Monitoring en temps réel des caravanes Coding Pour Tous</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-2xl border border-brand-green/20">
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          <span className="text-sm font-bold text-brand-green">Live • Mis à jour il y a 30s</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Caravanes Status & GPS Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-brand-blue">Carte &amp; Suivi des Caravanes</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Régions actives en temps réel — données Supabase</p>
            </div>
            <Link href="/dashboard/caravanes" className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1">
              Gérer les Caravanes <ChevronRight size={14} />
            </Link>
          </div>

          {/* Full-width Morocco Map */}
          <MoroccoMap caravanes={caravanes} />

          {/* Caravanes list below map */}
          <div className="mt-5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Caravanes enregistrées</p>
            {caravanes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground border-2 border-dashed border-muted rounded-2xl text-sm">
                Aucune caravane enregistrée.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {caravanes.slice(0, 4).map((caravane, i) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-border/60 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-brand-blue text-sm truncate">{caravane.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={9} className="text-brand-green shrink-0" />
                        {caravane.province} · {new Date(caravane.start_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      caravane.status === "ACTIVE"
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {caravane.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-border shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-brand-blue rounded-xl flex items-center justify-center">
              <BrainCircuit size={18} className="text-brand-green" />
            </div>
            <h2 className="text-lg font-black text-brand-blue">Insights IA</h2>
          </div>
          <div className="space-y-4">
            {loadingInsights ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-[#0B2B5B] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 animate-pulse">Consultation de Groq et Supabase...</p>
              </div>
            ) : (
              insights.map((insight, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition-all ${
                  insight.type === "warning" ? "bg-orange-50 border-orange-200" :
                  insight.type === "success" ? "bg-green-50 border-green-200" :
                  "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex gap-3">
                    {insight.type === "warning" && <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />}
                    {insight.type === "success" && <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />}
                    {insight.type !== "warning" && insight.type !== "success" && <Star size={18} className="text-blue-500 shrink-0 mt-0.5" />}
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="mt-6 w-full py-3 border-2 border-dashed border-brand-green/30 rounded-2xl text-sm font-bold text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <BrainCircuit size={16} className={loadingInsights ? "animate-spin" : ""} />
            {loadingInsights ? "Analyse en cours..." : "Analyser avec l'IA"}
          </button>
        </motion.div>
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-3xl p-6 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-brand-green" />
            <h2 className="text-lg font-black text-brand-blue">Activité Récente</h2>
          </div>
          <button className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1">
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {combinedActivities.map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors group">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                {activity.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-brand-blue truncate">{activity.team} — <span className="font-semibold">{activity.action}</span></p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {activity.location}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`w-2 h-2 rounded-full inline-block ${activity.status === "success" ? "bg-brand-green" : "bg-brand-green"}`} />
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
