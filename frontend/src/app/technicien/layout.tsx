"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Map, Sparkles, User, LogOut,
  Menu, X, Bell, ChevronRight, Wifi, WifiOff, FileText, GraduationCap
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { label: "Accueil", href: "/technicien", icon: Home },
  { label: "Rapports", href: "/technicien/rapports", icon: FileText },
  { label: "Formation", href: "/technicien/formation", icon: GraduationCap },
  { label: "Carte GPS", href: "/technicien/carte", icon: Map },
  { label: "IA Assist", href: "/technicien/coach", icon: Sparkles },
  { label: "Profil", href: "/technicien/profil", icon: User },
];
export default function TechnicienLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      if (typeof window !== 'undefined' && localStorage.getItem("mock_technicien") === "true") {
        setUser({ email: 'technicien@smartcaravan.com', id: 'mock-id' });
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
      localStorage.removeItem("mock_technicien");
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
            <Link href="/technicien" className="flex items-center gap-3 group">
              <Image
                src="/logo-coding-pour-tous.png"
                alt="Coding Pour Tous"
                width={100}
                height={40}
                className="object-contain h-8 w-auto"
                priority
              />
              <span className="hidden sm:block text-[10px] font-semibold text-slate-400 tracking-widest uppercase border-l border-white/10 pl-3">Espace Technicien</span>
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
                        ? "bg-gradient-to-r from-[#A4C639] to-[#A4C639]/80 text-white shadow-lg shadow-[#A4C639]/20"
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
                isOnline ? "bg-[#A4C639]/10 text-[#A4C639]" : "bg-red-500/10 text-red-400"
              }`}>
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isOnline ? "En ligne" : "Hors ligne"}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Bell size={20} className="text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#A4C639] rounded-full border-2 border-[#0F172A]" />
              </button>

              {/* Avatar */}
              <button
                onClick={() => router.push("/technicien/profil")}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A4C639] to-[#5E9FA3] flex items-center justify-center text-white font-black text-xs shadow-lg hover:shadow-[#A4C639]/30 transition-all"
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
                            ? "bg-[#A4C639]/15 text-[#A4C639]"
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
                  active ? "text-[#A4C639]" : "text-slate-500"
                }`}
              >
                <item.icon size={22} className={active ? "drop-shadow-[0_0_8px_rgba(0,180,160,0.5)]" : ""} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="w-1 h-1 bg-[#A4C639] rounded-full mt-0.5"
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
