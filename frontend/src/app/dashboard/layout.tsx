"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MapPin, Users, FileText,
  Settings, LogOut, Code2, ChevronLeft, Bell, Menu, Calendar,
  Sun, Moon, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import AIChatWidget from "@/components/layout/AIChatWidget";

const navItems = [
  { label: "Vue Globale", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytique IA", href: "/dashboard/analytique", icon: BrainCircuit },
  { label: "Planning", href: "/dashboard/planning", icon: Calendar },
  { label: "Caravanes", href: "/dashboard/caravanes", icon: MapPin },
  { label: "Équipes", href: "/dashboard/equipes", icon: Users },
  { label: "Rapports", href: "/dashboard/rapports", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        }
        // Note: on ne redirige PAS ici — le bypass test n'a pas de vraie
        // session Supabase, mais on laisse l'accès au dashboard quand même.
        // Une vraie protection auth devrait vérifier un cookie/token custom.
      } catch (e) {
        // Silently fail (offline mode, Supabase unreachable, etc.)
      } finally {
        setAuthChecked(true);
      }
    };
    getUser();

    // Init theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-6 mb-2", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            {/* <Image src="/logo.png" alt="Coding Pour Tous" width={200} height={60} className="object-contain" /> */}
            <div className="w-8 h-8 bg-[#1e3b70] dark:bg-[#6babb3] rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <circle cx="12" cy="12" r="2.5"></circle>
              </svg>
            </div>
            <span className="text-xl font-black text-[#1e3b70] dark:text-white tracking-tight">Smart<span className="text-[#98c242]">Caravan</span></span>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-[#1e3b70] dark:bg-[#6babb3] rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <circle cx="12" cy="12" r="2.5"></circle>
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-8 h-8 rounded-xl border border-border items-center justify-center text-muted-foreground hover:bg-muted hover:text-[#1e3b70] dark:hover:text-[#6babb3] transition-all"
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative",
                active
                  ? "bg-[#1e3b70] dark:bg-[#6babb3] text-white dark:text-slate-900 shadow-lg shadow-[#1e3b70]/20 dark:shadow-[#6babb3]/10"
                  : "text-muted-foreground hover:bg-muted hover:text-[#1e3b70] dark:hover:text-[#6babb3]"
              )}
            >
              <item.icon size={20} className={cn(active ? "text-white dark:text-slate-900" : "group-hover:text-[#98c242] transition-colors")} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-[#1e3b70] dark:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1 mt-4">
        <Link href="/dashboard/parametres" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-[#1e3b70] dark:hover:text-[#6babb3] transition-all">
          <Settings size={20} />
          {!collapsed && <span>Paramètres</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        {!collapsed && user && (
          <div className="mx-2 mt-4 p-3 rounded-xl bg-[#98c242]/10 border border-[#98c242]/20">
            <p className="text-xs font-black text-[#98c242] truncate">{user.email?.split('@')[0].toUpperCase()}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Non-blocking auth check: on rend l'interface immédiatement,
  // sans attendre la vérification de session Supabase.

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white dark:bg-[#1E293B] border-r border-border transition-all duration-300 shadow-sm",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-[#1E293B] shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu size={22} className="text-[#1e3b70] dark:text-[#6babb3]" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[200px]">
              {mounted ? new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={darkMode ? "Mode Clair" : "Mode Sombre"}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            >
              {darkMode
                ? <Sun size={17} className="text-amber-400" />
                : <Moon size={17} className="text-slate-500" />
              }
            </button>

            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#98c242] rounded-full border-2 border-white dark:border-[#1E293B]" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#1e3b70] dark:bg-[#6babb3] flex items-center justify-center text-white dark:text-slate-900 font-black text-sm shadow-md">
              NH
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
          {children}
        </main>

        {/* Floating Assistant IA Widget */}
        <AIChatWidget />
      </div>
    </div>
  );
}
