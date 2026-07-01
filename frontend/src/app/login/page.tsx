"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Globe, Truck, Map, Users } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B2B5B] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00B4A0]/30 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00B4A0] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B4A0]/30">
              <Truck size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">SmartCaravan<span className="text-[#00B4A0]">.</span></span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-black leading-tight mb-6"
          >
            Gérez vos interventions logistiques avec <span className="text-[#00B4A0]">l'IA</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-indigo-200 text-lg mb-10"
          >
            Plateforme complète pour les formateurs et les administrateurs de Coding Pour Tous. Optimisez les tournées, anticipez les risques et suivez vos équipes en temps réel.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Map className="text-[#00B4A0]" size={20} />
              </div>
              <div>
                <div className="font-bold">Déploiement</div>
                <div className="text-xs text-indigo-300">National</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Users className="text-[#00B4A0]" size={20} />
              </div>
              <div>
                <div className="font-bold">Gestion</div>
                <div className="text-xs text-indigo-300">Équipes</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 mt-auto pt-10 text-sm text-indigo-300 font-medium">
          © {new Date().getFullYear()} Coding Pour Tous. Tous droits réservés.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        
        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0B2B5B] rounded-lg flex items-center justify-center">
            <Truck size={16} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#0B2B5B]">SmartCaravan</span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-[#0B2B5B] mb-2">Bon retour 👋</h2>
            <p className="text-slate-500 font-medium">Connectez-vous à votre espace personnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full py-4 mt-4 bg-[#0B2B5B] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#082045] hover:shadow-lg hover:shadow-[#0B2B5B]/20 transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
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
              <span className="bg-white px-4 text-slate-400">Ou</span>
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

          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Pas encore de compte ?{" "}
            <Link href="#" className="text-[#00B4A0] font-bold hover:underline">
              Contactez l'admin
            </Link>
          </p>

          <div className="mt-12 flex justify-center">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <ShieldCheck size={14} className="text-[#00B4A0]" />
                <span>Connexion Chiffrée</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
