"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LayoutDashboard, LogOut, User, Smartphone } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen to auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Caravanes", href: "/dashboard/caravanes" },
    { name: "Équipes", href: "/dashboard/equipes" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Espace Formateur", href: "/formateur" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FC]/80 backdrop-blur-md px-6 py-4 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black text-[#0B2B5B] tracking-tight">
          SmartCaravan
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-bold text-[#0B2B5B]/70 hover:text-[#00B4A0] transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {loading ? (
            // Skeleton loader pendant la vérification de session
            <div className="w-28 h-9 bg-slate-200 rounded-full animate-pulse" />
          ) : user ? (
            // Connecté : afficher avatar + bouton Déconnexion
            <div className="flex items-center gap-3">
              <Link
                href="/formateur"
                className="flex items-center gap-2 px-4 py-2 bg-[#0B2B5B]/10 border border-[#0B2B5B]/20 text-[#0B2B5B] rounded-full font-bold text-sm hover:bg-[#0B2B5B] hover:text-white transition-all"
              >
                <Smartphone size={15} />
                Espace Formateur
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-[#00B4A0]/10 border border-[#00B4A0]/30 text-[#00B4A0] rounded-full font-bold text-sm hover:bg-[#00B4A0] hover:text-white transition-all"
              >
                <LayoutDashboard size={15} />
                Mon Dashboard
              </Link>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-500 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          ) : (
            // Non connecté : bouton Connexion
            <Link
              href="/login"
              className="px-6 py-2 bg-[#0B2B5B] text-white rounded-full font-bold text-sm hover:bg-[#00B4A0] hover:shadow-lg transition-all"
            >
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#0B2B5B]"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-2xl p-6 flex flex-col gap-4 md:hidden border-t border-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg font-bold text-[#0B2B5B]"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="mt-2 py-4 bg-[#00B4A0] text-white rounded-2xl font-bold text-center flex items-center justify-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={18} />
                Mon Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="py-4 bg-red-50 text-red-500 border border-red-200 rounded-2xl font-bold text-center flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
              <div className="px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-semibold">Connecté en tant que</p>
                <p className="text-sm font-black text-[#0B2B5B] truncate mt-0.5">{user.email}</p>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-2 py-4 bg-[#0B2B5B] text-white rounded-2xl font-bold text-center"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
