"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Trophy, Zap, Shield, Edit3, Save,
  LogOut, CheckCircle2, Clock, Award, Star, TrendingUp,
  Camera
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    points: 1240,
    level: "Expert Code",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile({
          fullName: profileData.full_name || "",
          phone: profileData.phone || "",
          points: profileData.points || 1240,
          level: profileData.level || "Expert Code",
        });

        if (profileData.full_name) {
          const { data: acts } = await supabase.from("activities").select("*").eq("trainer_name", profileData.full_name);
          if (acts) setActivities(acts);
        }
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.fullName,
      phone: profile.phone,
      points: profile.points,
      level: profile.level,
    });
    setSaving(false);
    if (error) {
      alert("Erreur : Impossible de sauvegarder le profil.");
    } else {
      alert("Profil mis à jour avec succès !");
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = profile.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "SC";

  const completedCount = activities.filter((a) => a.status === "completed").length;
  const pendingCount = activities.filter((a) => a.status === "pending").length;

  // Badges
  const badges = [
    { name: "Premier Check-in", icon: CheckCircle2, unlocked: completedCount >= 1 },
    { name: "5 Ateliers", icon: Star, unlocked: completedCount >= 5 },
    { name: "Expert Terrain", icon: Award, unlocked: completedCount >= 10 },
    { name: "Champion Code", icon: Trophy, unlocked: profile.points >= 2000 },
    { name: "Mentor IA", icon: TrendingUp, unlocked: profile.points >= 3000 },
    { name: "Légende", icon: Zap, unlocked: profile.points >= 5000 },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-3xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00B4A0] to-[#38BDF8] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[#00B4A0]/20">
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1E293B] border-2 border-[#0F172A] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#334155] transition-all">
            <Camera size={14} />
          </button>
        </div>

        <h1 className="text-2xl font-black">{profile.fullName || user?.email}</h1>
        <p className="text-slate-400 font-medium mt-1">
          {profile.level} — {profile.points} pts
        </p>

        {/* Level progress mini */}
        <div className="mt-3 max-w-xs mx-auto">
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (profile.points % 1000) / 10)}%` }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-amber-400 to-[#00B4A0] rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Terminés", value: completedCount, color: "text-[#00B4A0]" },
          { label: "Planifiés", value: pendingCount, color: "text-amber-400" },
          { label: "Total Points", value: profile.points, color: "text-[#38BDF8]" },
        ].map((s, i) => (
          <div key={i} className="bg-[#1E293B] rounded-2xl p-4 border border-white/5 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Profile Info Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1E293B] rounded-3xl p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Mes Informations</h2>
          <button
            onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isEditing
                ? "bg-[#00B4A0] text-white shadow-lg shadow-[#00B4A0]/20"
                : "text-[#00B4A0] hover:bg-[#00B4A0]/10"
            }`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Save size={16} />
            ) : (
              <Edit3 size={16} />
            )}
            {isEditing ? "Sauvegarder" : "Modifier"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Mail size={12} className="inline mr-1.5" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <User size={12} className="inline mr-1.5" />
              Nom complet
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={!isEditing}
              placeholder="Ex: Youssef Alami"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all ${
                isEditing
                  ? "border-[#00B4A0]/30 text-white focus:outline-none focus:border-[#00B4A0]"
                  : "border-white/5 text-slate-300 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Phone size={12} className="inline mr-1.5" />
              Téléphone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="Ex: +212 6 00 00 00 00"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all ${
                isEditing
                  ? "border-[#00B4A0]/30 text-white focus:outline-none focus:border-[#00B4A0]"
                  : "border-white/5 text-slate-300 cursor-not-allowed"
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Badges & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1E293B] rounded-3xl p-6 border border-white/5"
      >
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <Award size={20} className="text-amber-400" />
          Badges & Récompenses
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`text-center p-4 rounded-2xl border transition-all ${
                badge.unlocked
                  ? "bg-gradient-to-br from-amber-400/10 to-[#00B4A0]/10 border-amber-400/20"
                  : "bg-white/[0.02] border-white/5 opacity-40"
              }`}
            >
              <badge.icon
                size={24}
                className={`mx-auto mb-2 ${badge.unlocked ? "text-amber-400" : "text-slate-600"}`}
              />
              <p className={`text-xs font-bold ${badge.unlocked ? "text-white" : "text-slate-500"}`}>
                {badge.name}
              </p>
              {badge.unlocked && (
                <p className="text-[10px] text-[#00B4A0] font-bold mt-1">✓ Débloqué</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1E293B] rounded-3xl p-6 border border-white/5"
      >
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <Shield size={20} className="text-[#38BDF8]" />
          Sécurité & Confidentialité
        </h2>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <CheckCircle2 size={16} className="text-[#00B4A0] shrink-0" />
            <span>Authentification Supabase sécurisée (JWT)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <CheckCircle2 size={16} className="text-[#00B4A0] shrink-0" />
            <span>Row Level Security (RLS) activée</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <CheckCircle2 size={16} className="text-[#00B4A0] shrink-0" />
            <span>Conformité RGPD/CNDP pour les données terrain</span>
          </div>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all"
        >
          <LogOut size={18} />
          Me déconnecter
        </button>
      </motion.div>
    </div>
  );
}
