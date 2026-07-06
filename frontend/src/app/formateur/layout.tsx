"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Map, Sparkles, User, LogOut, Code2,
  Menu, X, Bell, ChevronRight, Wifi, WifiOff
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { label: "Accueil", href: "/formateur", icon: Home },
  { label: "Carte GPS", href: "/formateur/carte", icon: Map },
  { label: "IA Coach", href: "/formateur/coach", icon: Sparkles },
  { label: "Profil", href: "/formateur/profil", icon: User },
];

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      if (typeof window !== 'undefined' && localStorage.getItem("mock_formateur") === "true") {
        setUser({ email: 'formateur@smartcaravan.com', id: 'mock-id' });
        setProfile({ full_name: 'Formateur Test', role: 'Formateur' });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      } else {
        router.push("/login");
      }
    };
    getUser();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("mock_formateur");
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "SC";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      {/* ─── Top Header Bar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link href="/formateur" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#00B4A0] to-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B4A0]/20 group-hover:shadow-[#00B4A0]/40 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <circle cx="12" cy="12" r="2.5"></circle>
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-black tracking-tight">Smart<span className="text-[#00B4A0]">Caravan</span></span>
                <span className="block text-[10px] font-semibold text-slate-400 -mt-0.5 tracking-widest uppercase">Espace Formateur</span>
              </div>
            </Link>

            {/* Center: Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#00B4A0] to-[#00B4A0]/80 text-white shadow-lg shadow-[#00B4A0]/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Status + Avatar */}
            <div className="flex items-center gap-3">
              {/* Online indicator */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                isOnline ? "bg-[#00B4A0]/10 text-[#00B4A0]" : "bg-red-500/10 text-red-400"
              }`}>
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isOnline ? "En ligne" : "Hors ligne"}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Bell size={20} className="text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00B4A0] rounded-full border-2 border-[#0F172A]" />
              </button>

              {/* Avatar */}
              <button
                onClick={() => router.push("/formateur/profil")}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4A0] to-[#38BDF8] flex items-center justify-center text-white font-black text-xs shadow-lg hover:shadow-[#00B4A0]/30 transition-all"
              >
                {initials}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Nav Drawer ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[#1E293B] shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <span className="font-black text-lg">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X size={22} className="text-slate-400" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                          active
                            ? "bg-[#00B4A0]/15 text-[#00B4A0]"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        {active && <ChevronRight size={16} className="ml-auto" />}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold transition-all"
                  >
                    <LogOut size={20} />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1E293B]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  active ? "text-[#00B4A0]" : "text-slate-500"
                }`}
              >
                <item.icon size={22} className={active ? "drop-shadow-[0_0_8px_rgba(0,180,160,0.5)]" : ""} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="w-1 h-1 bg-[#00B4A0] rounded-full mt-0.5"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
