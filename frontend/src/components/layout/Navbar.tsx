"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Home,
  LayoutDashboard,
  MapPin,
  Wrench,
  GraduationCap,
  LogOut,
  LogIn
} from "lucide-react";

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

  const roundedSpaces = [
    {
      name: "Accueil",
      href: "/",
      icon: Home,
      style: "bg-[#1F3C6D]/10 border-[#1F3C6D]/20 text-[#1F3C6D] hover:bg-[#1F3C6D] hover:text-white"
    },
    {
      name: "Espace Admin",
      href: "/dashboard",
      icon: LayoutDashboard,
      style: "bg-[#A4C639]/10 border-[#A4C639]/30 text-[#A4C639] hover:bg-[#A4C639] hover:text-white"
    },
    {
      name: "Coordinateur",
      href: "/coordinateur",
      icon: MapPin,
      style: "bg-[#FDB813]/10 border-[#FDB813]/30 text-[#FDB813] hover:bg-[#FDB813] hover:text-white"
    },
    {
      name: "Technicien",
      href: "/technicien",
      icon: Wrench,
      style: "bg-[#5E9FA3]/10 border-[#5E9FA3]/30 text-[#5E9FA3] hover:bg-[#5E9FA3] hover:text-white"
    },
    {
      name: "Formateur",
      href: "/formateur",
      icon: GraduationCap,
      style: "bg-[#1F3C6D]/10 border-[#1F3C6D]/20 text-[#1F3C6D] hover:bg-[#1F3C6D] hover:text-white"
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FC]/90 backdrop-blur-md px-6 py-4 md:px-12 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-coding-pour-tous.png"
            alt="Coding Pour Tous"
            width={120}
            height={48}
            className="object-contain h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Rounded Badge Nav */}
        <div className="hidden lg:flex items-center gap-2.5">
          {roundedSpaces.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-full font-bold text-xs shadow-xs transition-all duration-200 ${item.style}`}
            >
              <item.icon size={14} />
              {item.name}
            </Link>
          ))}

          {loading ? (
            <div className="w-24 h-8 bg-slate-200 rounded-full animate-pulse ml-2" />
          ) : user ? (
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 text-red-500 rounded-full font-bold text-xs hover:bg-red-500 hover:text-white transition-all ml-1"
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1F3C6D] text-white border border-[#1F3C6D] rounded-full font-bold text-xs hover:bg-[#A4C639] hover:border-[#A4C639] shadow-sm transition-all ml-1"
            >
              <LogIn size={14} />
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-[#1F3C6D]"
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
        <div className="absolute top-full left-0 right-0 bg-white shadow-2xl p-6 flex flex-col gap-3 lg:hidden border-t border-gray-100">
          {roundedSpaces.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-3 border rounded-2xl font-bold text-sm transition-all ${item.style}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={16} />
              {item.name}
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="py-3 bg-red-50 text-red-500 border border-red-200 rounded-2xl font-bold text-center flex items-center justify-center gap-2 text-sm mt-1"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              className="py-3 bg-[#1F3C6D] text-white rounded-2xl font-bold text-center text-sm flex items-center justify-center gap-2 mt-1"
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={16} />
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
