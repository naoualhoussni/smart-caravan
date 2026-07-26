"use client";

import React, { useState } from "react";
import { BookOpen, Camera, FileText, Play, Plus, GraduationCap, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function EspaceFormateur() {
  const [sessionForm, setSessionForm] = useState({
    date: "",
    module: "IoT & robotique",
    sessionNum: "1",
    duration: "2h",
    timeSlot: "",
    videos: [],
    photos: []
  });

  const [matricule, setMatricule] = useState("FRM-001");

  const modules = ["IoT & robotique", "programmation", "scratch", "comportement conceptuel"];

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Séance ajoutée avec succès !");
    // Code to send to DB
  };

  const materials = [
    { title: "Introduction à Scratch", type: "video", module: "scratch" },
    { title: "Guide Capteurs IoT", type: "document", module: "IoT & robotique" },
    { title: "Bases Python", type: "document", module: "programmation" },
    { title: "Atelier Comportement", type: "photo", module: "comportement conceptuel" }
  ];

  return (
    <div className="min-h-screen bg-brand-white pt-24 px-4 sm:px-6 md:px-12 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-blue">Espace Formateur</h1>
            <p className="text-muted-foreground font-medium mt-1">Gérez vos séances et consultez vos supports pédagogiques.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-border">
            <span className="text-sm font-bold text-muted-foreground">Matricule:</span>
            <span className="ml-2 text-brand-green font-black">{matricule}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form to add session */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-black text-brand-blue mb-6 flex items-center gap-2">
              <Plus size={20} className="text-brand-green"/> Ajouter une Séance
            </h2>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Date</label>
                  <input required type="date" className="w-full p-3 bg-muted/50 rounded-xl border border-transparent focus:bg-white focus:border-brand-green outline-none" 
                    value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Créneau horaire</label>
                  <input required type="text" placeholder="Ex: 09:00 - 11:00" className="w-full p-3 bg-muted/50 rounded-xl border border-transparent focus:bg-white focus:border-brand-green outline-none" 
                    value={sessionForm.timeSlot} onChange={e => setSessionForm({...sessionForm, timeSlot: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Module</label>
                <select className="w-full p-3 bg-muted/50 rounded-xl border border-transparent focus:bg-white focus:border-brand-green outline-none"
                  value={sessionForm.module} onChange={e => setSessionForm({...sessionForm, module: e.target.value})}>
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">N° Séance</label>
                  <select className="w-full p-3 bg-muted/50 rounded-xl border border-transparent focus:bg-white focus:border-brand-green outline-none"
                    value={sessionForm.sessionNum} onChange={e => setSessionForm({...sessionForm, sessionNum: e.target.value})}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Séance {n}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Durée</label>
                  <input disabled type="text" value="2h" className="w-full p-3 bg-muted/50 rounded-xl border border-transparent text-slate-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Vidéos et Photos (Supports)</label>
                <div className="w-full p-4 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/80">
                  <Camera size={18} className="text-brand-blue" />
                  <span className="text-sm font-bold text-brand-blue">Téléverser les médias</span>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-brand-green text-white font-black rounded-xl mt-4 hover:shadow-lg transition-all">
                Enregistrer la Séance
              </button>
            </form>
          </motion.div>

          {/* Educational Materials */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="bg-gradient-to-br from-brand-blue to-[#162f55] rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl"><GraduationCap size={24} /></div>
                <div>
                  <h3 className="font-black text-xl">Formation Formateur</h3>
                  <p className="text-white/70 text-sm">6 Séances de 2h au total</p>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium">Les formateurs doivent compléter les séances pour maîtriser l'enseignement dans chaque école.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-black text-brand-blue mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-brand-green"/> Supports Pédagogiques
              </h2>
              <div className="space-y-3">
                {materials.map((mat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted transition-colors cursor-pointer border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        {mat.type === 'video' ? <Play size={16} className="text-brand-teal" /> : 
                         mat.type === 'document' ? <FileText size={16} className="text-brand-blue" /> : 
                         <Camera size={16} className="text-brand-green" />}
                      </div>
                      <div>
                        <p className="font-bold text-brand-blue text-sm">{mat.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{mat.module}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-brand-green hover:underline">Consulter</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
