"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  ChevronRight,
  Save,
  Camera
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("light");
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Charger le thème depuis le localStorage
    const savedTheme = localStorage.getItem("sc-theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("sc-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Apparence", icon: Palette },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-brand-blue">Paramètres</h1>
        <p className="text-muted-foreground font-medium mt-1">Gérez votre compte et vos préférences SmartCaravan.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                  : "bg-white border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] border border-border shadow-sm p-8"
          >
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-brand-blue/10 rounded-[32px] flex items-center justify-center text-brand-blue text-3xl font-black">
                      {user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-brand-blue text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-brand-blue">Photo de Profil</h2>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Recommandé : 256x256px en PNG ou JPG.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-brand-blue ml-1">Nom Complet</label>
                    <input 
                      type="text" 
                      defaultValue={user?.email?.split('@')[0] || ""}
                      className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-brand-blue ml-1">Adresse Email</label>
                    <input 
                      type="email" 
                      disabled
                      value={user?.email || ""}
                      className="w-full px-5 py-4 bg-muted/10 border border-transparent rounded-2xl font-medium text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-brand-blue ml-1">Rôle</label>
                    <input 
                      type="text" 
                      disabled
                      value="Coordinateur National"
                      className="w-full px-5 py-4 bg-muted/10 border border-transparent rounded-2xl font-medium text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-brand-blue ml-1">Numéro de Téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="+212 6..."
                      className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                   <button className="flex items-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-brand-blue/30 transition-all active:scale-95">
                      <Save size={18} />
                      Enregistrer les modifications
                   </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
               <div className="space-y-8">
                  <h2 className="text-xl font-black text-brand-blue">Sécurité du Compte</h2>
                  <div className="space-y-6">
                     <div className="p-6 bg-muted/30 rounded-3xl border border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue border border-border">
                              <Shield size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-brand-blue">Double Authentification (2FA)</p>
                              <p className="text-xs text-muted-foreground font-medium">Ajoutez une couche de sécurité supplémentaire.</p>
                           </div>
                        </div>
                        <button className="text-xs font-black text-brand-blue bg-white px-4 py-2 rounded-lg border border-border hover:bg-brand-blue hover:text-white transition-all">
                           Activer
                        </button>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-black text-brand-blue ml-1">Changer le mot de passe</h3>
                        <div className="grid gap-4">
                           <input 
                             type="password" 
                             placeholder="Mot de passe actuel"
                             className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none transition-all font-medium"
                           />
                           <input 
                             type="password" 
                             placeholder="Nouveau mot de passe"
                             className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none transition-all font-medium"
                           />
                        </div>
                        <button className="mt-2 py-3 px-6 bg-brand-blue/5 text-brand-blue rounded-xl font-bold text-sm hover:bg-brand-blue hover:text-white transition-all">
                           Mettre à jour le mot de passe
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === "notifications" && (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
                     <Bell size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue mb-2">Préférences de Notification</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">Choisissez comment vous souhaitez être informé des activités de vos équipes.</p>
               </div>
            )}

            {activeTab === "appearance" && (
               <div className="space-y-8">
                  <h2 className="text-xl font-black text-brand-blue">Personnalisation de l'Interface</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                     <button 
                       onClick={() => toggleTheme("light")}
                       className={cn(
                        "p-6 border-2 rounded-3xl text-left transition-all",
                        theme === "light" ? "border-brand-blue bg-brand-blue/5 shadow-lg" : "border-transparent bg-muted/10 hover:border-muted"
                       )}
                     >
                        <div className="w-12 h-12 bg-brand-blue rounded-xl mb-4" />
                        <p className="font-black text-brand-blue">Smart Mode (Light)</p>
                        <p className="text-xs text-muted-foreground font-medium">Parfait pour le travail en journée.</p>
                     </button>
                     <button 
                       onClick={() => toggleTheme("dark")}
                       className={cn(
                        "p-6 border-2 rounded-3xl bg-slate-900 text-left text-white transition-all",
                        theme === "dark" ? "border-brand-green shadow-[0_0_20px_rgba(0,180,160,0.3)]" : "border-transparent opacity-80 hover:opacity-100"
                       )}
                     >
                        <div className="w-12 h-12 bg-brand-green rounded-xl mb-4 shadow-[0_0_20px_rgba(0,180,160,0.4)]" />
                        <p className="font-black">Deep Dark</p>
                        <p className="text-xs text-white/40 font-medium">Pour une concentration maximale.</p>
                     </button>
                  </div>
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
