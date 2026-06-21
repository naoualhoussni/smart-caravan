"use client";

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 px-6 md:px-12 bg-gradient-to-b from-[#F8F9FC] via-[#FFFFFF] to-[#F8F9FC] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#00B4A0]/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-[#0B2B5B]/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse duration-[6000ms]" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,43,91,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,43,91,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative">
        
        {/* Left Content (Grid Column 7) */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 bg-[#00B4A0]/10 px-4 py-2 rounded-full border border-[#00B4A0]/20">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B4A0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B4A0]"></span>
            </span>
            <span className="text-xs font-black text-[#00B4A0] tracking-wider uppercase">Caravane 2026 Active</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-[5.5rem] font-black text-[#0B2B5B] leading-[1.05] tracking-tight">
            Propulser le <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-[#0B2B5B] via-[#0052a3] to-[#00B4A0] bg-clip-text text-transparent">Coding Rural</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#0B2B5B]/70 max-w-2xl leading-relaxed font-medium">
            Une plateforme tout-en-un révolutionnaire unissant <span className="text-[#00B4A0] font-bold">Intelligence Artificielle</span>, 
            analyse prédictive et <span className="text-[#0B2B5B] font-bold">tracking GPS de pointe</span>. Suivez l'impact social et géolocalisé de la caravane en temps réel.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href="/dashboard" 
              className="px-10 py-5 bg-gradient-to-r from-[#0B2B5B] to-[#1a4b8f] text-white rounded-2xl font-bold shadow-xl shadow-[#0B2B5B]/15 hover:shadow-[#0B2B5B]/35 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Accéder au Dashboard</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1.5 transition-transform duration-200">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            
            <a 
              href="#stats" 
              className="px-10 py-5 bg-white text-[#0B2B5B] border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Découvrir l'impact</span>
            </a>
          </div>

          {/* Micro-Features Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-2xl font-extrabold text-[#0B2B5B]">1500+</p>
              <p className="text-xs font-semibold text-slate-400">Élèves formés</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#00B4A0]">98%</p>
              <p className="text-xs font-semibold text-slate-400">Taux de satisfaction</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-2xl font-extrabold text-[#0B2B5B]">CNPD</p>
              <p className="text-xs font-semibold text-slate-400">100% Conforme RGPD</p>
            </div>
          </div>
        </div>

        {/* Right Interactive Mockups Column (Grid Column 5) */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
          
          {/* Main Visual: Glassmorphic Mobile App Frame */}
          <div className="relative w-80 h-[580px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            {/* Phone Screen Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-955 rounded-full" />
            </div>

            {/* Screen Content Mockup */}
            <div className="flex-1 bg-[#F8F9FC] rounded-[38px] p-5 pt-8 flex flex-col overflow-hidden relative">
              {/* App Status bar */}
              <div className="flex justify-between items-center text-[10px] font-black text-[#0B2B5B]/50 mb-4">
                <span>09:41</span>
                <div className="flex gap-1.5 items-center">
                  <span className="w-3.5 h-2 bg-[#00B4A0] rounded-sm" />
                </div>
              </div>

              {/* App Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#00B4A0] uppercase tracking-wider">Formateur Terrain</p>
                  <p className="text-base font-black text-[#0B2B5B]">Youssef Alami</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0B2B5B] flex items-center justify-center text-white font-extrabold text-xs">
                  YA
                </div>
              </div>

              {/* GPS Check-in Card (Interactive view) */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-[#0B2B5B]">Présence GPS</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Validé</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <span className="text-xs font-bold text-[#0B2B5B]">Lycée Al Farabi</span>
                </div>
                <p className="text-[9px] text-slate-400">Lat: 33.5333 • Lng: -5.1167</p>
              </div>

              {/* Coach IA Bubble Preview */}
              <div className="bg-[#0A1F44] text-white p-4 rounded-2xl shadow-sm space-y-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🤖</span>
                  <span className="text-[10px] font-bold text-[#00B4A0]">SmartCaravan IA</span>
                </div>
                <p className="text-[10px] leading-relaxed opacity-90">
                  L'atelier robotique Arduino est prêt. Les quiz élèves ont été pré-générés avec succès.
                </p>
              </div>

              {/* Bottom Nav Simulation */}
              <div className="absolute bottom-2 left-4 right-4 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex justify-around items-center px-2">
                <span className="text-sm opacity-100 filter-none">🏠</span>
                <span className="text-sm opacity-40">🗺️</span>
                <span className="text-sm opacity-40">🤖</span>
                <span className="text-sm opacity-40">👤</span>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphism Badge 1: Statistics Card */}
          <div className="absolute -left-16 bottom-24 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/20 w-48 hidden sm:block z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center text-[#00B4A0]">
                📈
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Impact Direct</p>
                <p className="text-xs font-black text-[#0B2B5B]">Statistiques</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Robots activés</span>
                <span className="font-extrabold text-[#0B2B5B]">34</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-[#00B4A0]" />
              </div>
            </div>
          </div>

          {/* Floating Glassmorphism Badge 2: Map Pointer Badge */}
          <div className="absolute -right-8 top-16 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 hidden sm:block z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-500 text-xs">●</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">Dernier Check-in</p>
                <p className="text-xs font-black text-[#0B2B5B]">Ifrane - 100% OK</p>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </section>
  );
};

export default Hero;
