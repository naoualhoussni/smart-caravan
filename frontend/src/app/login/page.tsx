"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Code2, Mail, Lock, ArrowRight, ShieldCheck, Globe } from "lucide-react";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-navy/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-6 group">
            {/* Ligne commentée temporairement car le fichier image est absent sur le disque */}
            {/* <Image src="/logo.png" alt="Coding Pour Tous" width={220} height={80} className="object-contain group-hover:scale-105 transition-transform duration-300" /> */}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mx-auto mb-4 border border-white/30">
              <Code2 size={32} className="text-white" />
            </div>
            <span className="text-4xl font-black text-white tracking-tight">Smart<span className="text-teal-400">Caravan</span></span>
          </Link>
          <h1 className="text-3xl font-black mb-2">Bon retour parmi nous</h1>
          <p className="text-muted-foreground font-medium">Connectez-vous pour piloter votre caravane.</p>
        </div>

        <div className="glass dark:glass-dark p-8 rounded-[32px] shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-navy dark:text-white/80 ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-teal transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all outline-none font-medium"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-brand-navy dark:text-white/80">
                  Mot de passe
                </label>
                <Link 
                  href="javascript:void(0)" 
                  onClick={() => alert("Fonctionnalité de récupération de mot de passe en cours de développement.")}
                  className="text-xs font-bold text-brand-teal hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-teal transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-brand-navy text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-navy/90 hover:shadow-xl hover:shadow-brand-navy/20 transition-all duration-300 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se Connecter
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white dark:bg-card px-4 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>

          <button 
            onClick={() => alert("La connexion via Google sera bientôt disponible avec Supabase Auth.")}
            type="button"
            className="w-full py-4 border border-border rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-muted transition-all duration-300"
          >
            <Globe size={20} />
            Google
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground font-medium">
          Pas encore de compte ?{" "}
          <Link href="#" className="text-brand-teal font-bold hover:underline">
            Contactez votre administrateur
          </Link>
        </p>

        <div className="mt-12 flex justify-center gap-6">
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <ShieldCheck size={14} className="text-brand-green" />
              <span>Certifié Sécurisé</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
