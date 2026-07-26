"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Users, BookOpen, Download, AlertTriangle, CheckCircle2, ChevronDown, Activity, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Chargement dynamique de la carte pour éviter les erreurs SSR Leaflet
const MoroccoMap = dynamic(() => import("@/components/MoroccoMap"), { ssr: false });

interface Caravane {
  id: string;
  name: string;
  province: string;
  status: string;
  start_date?: string;
  description?: string;
  participants_count?: number;
}

export default function CoordinateurPage() {
  const [caravanes, setCaravanes] = useState<Caravane[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("Tinghir");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const PROVINCES = [
    "Tinghir",
    "Ouarzazate",
    "Zagora",
    "Errachidia",
    "Midelt"
  ];

  useEffect(() => {
    fetchCaravanes();
  }, [selectedProvince]);

  const fetchCaravanes = async () => {
    setLoading(true);
    // On récupère toutes les caravanes, puis on filtre côté client
    // (en production, on filtrerait via la requête Supabase .eq('province', selectedProvince))
    const { data } = await supabase.from('caravans').select('*').order('created_at', { ascending: false });
    if (data) {
      setCaravanes((data as Caravane[]).filter((c) => c.province.toLowerCase() === selectedProvince.toLowerCase()));
    }
    setLoading(false);
  };

  const kpis = {
    totalSchools: caravanes.length > 0 ? caravanes.length * 3 : 0, // Mock: 3 écoles par caravane
    totalStudents: caravanes.reduce((acc, curr) => acc + (curr.participants_count || 0), 0),
    engagementRate: 85, // Mock
    status: caravanes.some(c => c.status === "ACTIVE") ? "En Cours" : "Terminé"
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1F3C6D] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Sélecteur de Province */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Espace Coordinateur <span className="text-[#A4C639]">.</span>
            </h1>
            <p className="text-[#1F3C6D]/70 font-medium">
              Supervision provinciale, KPIs et suivi des trajets
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-[#1F3C6D] font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A4C639] transition-all"
              >
                {PROVINCES.map(prov => (
                  <option key={prov} value={prov}>Province: {prov}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
            </div>
            
            <button 
              onClick={() => alert(`Génération du rapport PDF pour la province ${selectedProvince}...`)}
              className="flex items-center gap-2 bg-[#1F3C6D] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#1F3C6D]/20 hover:bg-[#A4C639] hover:shadow-[#A4C639]/30 transition-all"
            >
              <Download size={18} />
              Rapport Provincial
            </button>
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1F3C6D]/10 flex items-center justify-center">
              <MapPin className="text-[#1F3C6D]" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Écoles Visitées</p>
              <p className="text-2xl font-black text-[#1F3C6D]">{kpis.totalSchools}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FDB813]/10 flex items-center justify-center">
              <Users className="text-[#FDB813]" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Bénéficiaires</p>
              <p className="text-2xl font-black text-[#1F3C6D]">{kpis.totalStudents}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#A4C639]/10 flex items-center justify-center">
              <Activity className="text-[#A4C639]" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Taux d&apos;Engagement</p>
              <p className="text-2xl font-black text-[#1F3C6D]">{kpis.engagementRate}%</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5E9FA3]/10 flex items-center justify-center">
              <Sparkles className="text-[#5E9FA3]" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Statut Global</p>
              <p className="text-xl font-black text-[#1F3C6D]">{kpis.status}</p>
            </div>
          </motion.div>
        </div>

        {/* Map & Activités */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <MapPin className="text-[#A4C639]" size={20} />
                Carte et Trajet - {selectedProvince}
              </h2>
              {loading ? (
                <div className="h-[360px] bg-slate-100 animate-pulse rounded-2xl" />
              ) : (
                <MoroccoMap caravanes={caravanes} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
              <h2 className="text-lg font-black mb-4">Caravanes dans la Province</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
                </div>
              ) : caravanes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <AlertTriangle size={32} className="mb-2 opacity-50" />
                  <p className="font-medium text-sm">Aucune caravane prévue dans cette province.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                  {caravanes.map(caravan => (
                    <div key={caravan.id} className="p-4 rounded-2xl border border-slate-100 hover:border-[#1F3C6D]/20 transition-all bg-[#F8F9FC]/50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm">{caravan.name}</h3>
                        {caravan.status === 'ACTIVE' ? (
                          <span className="w-2 h-2 rounded-full bg-[#A4C639] animate-pulse mt-1" title="En cours" />
                        ) : (
                          <CheckCircle2 size={14} className="text-slate-400 mt-0.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">{caravan.description || "Aucune description"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
