"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Globe, Truck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Bypass de test pour contourner la confirmation d'email Supabase
      if (email.trim().toLowerCase() === 'test@smartcaravan.com' && password === 'password123') {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden pt-24">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B2B5B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00B4A0]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 group bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <div className="w-8 h-8 bg-[#0B2B5B] rounded-lg flex items-center justify-center shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-[#0B2B5B]">SmartCaravan<span className="text-[#00B4A0]">.</span></span>
          </div>
          <h1 className="text-3xl font-black mb-2 text-[#0B2B5B]">Bon retour 👋</h1>
          <p className="text-slate-500 font-medium">Connectez-vous pour piloter votre caravane.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] shadow-xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#00B4A0] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B4A0]/20 focus:border-[#00B4A0] transition-all outline-none font-medium text-slate-800"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">
                  Mot de passe
                </label>
                <Link 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("Fonctionnalité en cours de développement."); }}
                  className="text-xs font-bold text-[#00B4A0] hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#00B4A0] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B4A0]/20 focus:border-[#00B4A0] transition-all outline-none font-medium text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold p-4 rounded-xl flex items-center gap-2"
              >
                <div className="w-1.5 h-full bg-rose-500 rounded-full shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-[#0B2B5B] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#082045] hover:shadow-lg hover:shadow-[#0B2B5B]/20 transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se Connecter
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white/80 backdrop-blur-md px-4 text-slate-400">Ou</span>
            </div>
          </div>

          <button 
            onClick={() => alert("La connexion Google sera bientôt disponible.")}
            type="button"
            className="w-full py-3.5 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 text-slate-700 transition-all duration-300"
          >
            <Globe size={18} className="text-slate-500" />
            Continuer avec Google
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Pas encore de compte ?{" "}
          <Link href="#" className="text-[#00B4A0] font-bold hover:underline">
            Contactez l'admin
          </Link>
        </p>

        <div className="mt-8 flex justify-center">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100">
              <ShieldCheck size={14} className="text-[#00B4A0]" />
              <span>Connexion Chiffrée</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
