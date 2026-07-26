"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Mail, Award, BookOpen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FormateurProfilPage() {
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("Formateur SmartCaravan");
  const [matricule] = useState("FRM-" + Math.floor(1000 + Math.random() * 9000));
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (data?.full_name) setFullName(data.full_name);
      }
    };
    getUser();
  }, []);

  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-3xl p-8 border border-white/5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FDB813] to-[#1F3C6D] flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl">
            {initials}
          </div>
          <h1 className="text-2xl font-black">{fullName}</h1>
          <p className="text-[#FDB813] font-bold mt-1">Formateur Certifié</p>
          <p className="text-slate-400 text-sm mt-1">{userEmail}</p>

          <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
            {[
              { icon: <Award size={20} />, label: "Matricule", value: matricule, color: "text-[#FDB813]" },
              { icon: <BookOpen size={20} />, label: "Séances", value: "6 / 6", color: "text-[#A4C639]" },
              { icon: <User size={20} />, label: "Modules", value: "4", color: "text-[#5E9FA3]" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4">
                <div className={`${item.color} mb-1 flex justify-center`}>{item.icon}</div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="font-black text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-left">
            {[
              { icon: <Mail size={16} />, label: "Email", value: userEmail || "—" },
              { icon: <Award size={16} />, label: "Rôle", value: "Formateur" },
              { icon: <BookOpen size={16} />, label: "Spécialité", value: "IoT & Robotique / Scratch / Programmation" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                <span className="text-slate-400">{row.icon}</span>
                <span className="text-slate-400 text-sm font-medium w-20">{row.label}</span>
                <span className="text-sm font-bold truncate">{row.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white py-3 rounded-2xl font-bold transition-all"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  );
}
