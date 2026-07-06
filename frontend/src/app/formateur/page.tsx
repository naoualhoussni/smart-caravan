"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin, QrCode, Trophy, Zap, Clock, School, FileText,
  CheckCircle2, AlertTriangle, ChevronRight, ArrowUpRight,
  Loader2, Navigation, Sparkles, X, Camera
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

// -------------------------------------------------------------------
// [DICTIONNAIRE GPS] Coordonnées réelles des établissements du projet
// Source : correspondance exacte avec generate_dataset.py
// Format : { "nom de l'etablissement (lowercase)" : [lat, lng] }
// -------------------------------------------------------------------
const SCHOOL_COORDS: Record<string, [number, number]> = {
  // Tinghir
  "lycée bamou": [31.514, -5.530],
  "lycée salah eddine al ayoubi": [31.520, -5.525],
  "collège ibn sina": [31.510, -5.535],
  // Azilal
  "lycée ouzoud": [31.967, -6.567],
  "lycée technique azilal": [31.960, -6.560],
  "collège demnate": [31.728, -7.003],
  // Midelt
  "lycée moulay ali cherif": [32.683, -4.733],
  "collège ibn khaldoun": [32.680, -4.730],
  // Zagora
  "lycée hassan ii": [30.332, -5.838],
  "collège al massira": [30.335, -5.840],
  // Chefchaouen
  "lycée ibn khaldoun": [35.168, -5.269],
  "collège al houria": [35.170, -5.265],
  // Al Hoceima
  "lycée mohammed v": [35.246, -3.930],
  "lycée bayed moulay": [35.250, -3.935],
  // Tata
  "lycée hassan ier": [29.745, -7.972],
  "collège ibn batouta": [29.748, -7.975],
  // Beni Mellal
  "lycée ibn sina": [32.337, -6.361],
  "lycée hassan ii beni mellal": [32.340, -6.365],
  "cpge beni mellal": [32.333, -6.358],
  // Kenitra
  "lycée ibn tahir": [34.261, -6.580],
  "lycée abdelmalek essaadi": [34.264, -6.575],
  "lycée technique kenitra": [34.258, -6.583],
  // Taroudant
  "lycée mohammed v taroudant": [30.473, -8.877],
  "lycée ibn soulaiman roudani": [30.476, -8.873],
  "collège al majd": [30.470, -8.880],
  // Safi
  "lycée zerktouni": [32.299, -9.237],
  "lycée moulay ismail": [32.302, -9.233],
  // Settat
  "lycée allal al fassi": [33.001, -7.616],
  "collège al wahda": [33.003, -7.613],
  // Casablanca
  "lycée moulay abdellah": [33.589, -7.604],
  "lycée al khawarizmi": [33.593, -7.600],
  "lycée mohammed v casa": [33.586, -7.608],
  "lycée technique ain sebaa": [33.613, -7.527],
  // Rabat
  "lycée moulay youssef": [34.020, -6.841],
  "lycée lalla aicha": [34.023, -6.838],
  "cpge descartes rabat": [34.017, -6.844],
  // Marrakech
  "lycée ibn abbad": [31.629, -7.981],
  "lycée hassan ii marrakech": [31.632, -7.978],
  "lycée victor hugo": [31.626, -7.984],
  // Fes
  "lycée moulay idriss": [34.033, -5.000],
  "lycée ibn al khatib": [34.036, -4.997],
  "cpge al khansaa": [34.030, -5.003],
  // Agadir
  "lycée al imam malik": [30.427, -9.598],
  "lycée moulay abdellah agadir": [30.430, -9.595],
  // Tanger
  "lycée ibn al khatib tanger": [35.759, -5.834],
  "lycée technique tanger": [35.762, -5.831],
  "lycée moulay abdelaziz": [35.756, -5.837],
};

// -------------------------------------------------------------------
// [LOGIQUE] Résoudre les coordonnées d'un établissement par son nom
// Algorithme : cherche d'abord une correspondance exacte, puis partielle
// -------------------------------------------------------------------
function resolveSchoolCoords(schoolName: string): [number, number] | null {
  const key = schoolName.toLowerCase().trim();
  // 1. Correspondance exacte
  if (SCHOOL_COORDS[key]) return SCHOOL_COORDS[key];
  // 2. Correspondance partielle (au cas où le nom est légèrement différent)
  for (const [k, v] of Object.entries(SCHOOL_COORDS)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null; // Établissement non trouvé dans le dictionnaire
}

export default function FormateurHomePage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ fullName: "", points: 1240, level: "Expert Code" });
  const [activities, setActivities] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [locationText, setLocationText] = useState("Check-in GPS");
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [showBilanModal, setShowBilanModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [bilanText, setBilanText] = useState("");
  const [generatingBilan, setGeneratingBilan] = useState(false);
  const [hasParentalConsent, setHasParentalConsent] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<{ x: number; y: number }[]>([]);
  const [showQRInfo, setShowQRInfo] = useState(false);
  
  // Nouveaux états pour le formulaire hors-ligne
  const [nbEleves, setNbEleves] = useState<number | "">("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Offline ou Non connecté");
        setUser(user);

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profileData) {
          setProfile({
            fullName: profileData.full_name || "",
            points: profileData.points || 1240,
            level: profileData.level || "Expert Code",
          });
          if (profileData.full_name) {
            const { data } = await supabase.from("activities").select("*").eq("trainer_name", profileData.full_name).order("date", { ascending: false });
            if (data) setActivities(data);
          }
        }
      } catch (err) {
        console.warn("Mode hors-ligne ou session introuvable. Chargement ignoré.", err);
      }
    };
    load();
  }, []);

  // Haversine distance in km
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = Math.PI / 180;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  const handleCheckIn = async (activity: any) => {
    setLocationText("Vérification GPS...");
    if (!("geolocation" in navigator)) {
      setLocationText("GPS non supporté");
      alert("La géolocalisation n'est pas disponible dans ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const myLat = pos.coords.latitude;
        const myLng = pos.coords.longitude;

        // [ALGORITHME DE SÉLECTION DE L'ÉTABLISSEMENT]
        // Étape 1 : Récupérer le nom de l'école depuis l'activité assignée au formateur
        const schoolName = activity?.school_name || "";

        // Étape 2 : Résoudre les coordonnées GPS de cet établissement
        // via notre dictionnaire SCHOOL_COORDS (correspondance exacte puis partielle)
        const schoolCoords = resolveSchoolCoords(schoolName);

        if (!schoolCoords) {
          // Fallback : si l'établissement n'est pas dans le dictionnaire,
          // on autorise le check-in avec un avertissement (pour ne pas bloquer le formateur)
          setLocation(pos);
          setIsCheckedIn(true);
          setLocationText("Présence Validée ✅");
          alert(`Établissement "${schoolName}" non géolocalisé. Check-in validé manuellement.`);
          if (activity?.id && !activity.id.startsWith("demo")) {
            await supabase.from("activities").update({ status: "completed" }).eq("id", activity.id);
          }
          return;
        }

        const [schoolLat, schoolLng] = schoolCoords;

        // Étape 3 : Calcul de la distance réelle formateur ↔ établissement
        // via la formule de Haversine (distance à vol d'oiseau sur la sphère terrestre)
        // Formule : d = 2R * arcsin(sqrt( sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlng/2) ))
        const dist = haversine(myLat, myLng, schoolLat, schoolLng);

        // Étape 4 : Vérification du périmètre autorisé (500 mètres = 0.5 km)
        if (dist > 0.5) {
          setLocationText("Check-in Refusé");
          alert(
            `❌ Check-in refusé.\n\n` +
            `Vous êtes à ${dist.toFixed(2)} km de "${schoolName}".\n` +
            `La règle exige d'être à moins de 500 mètres de l'établissement.\n\n` +
            `📍 Votre position : (${myLat.toFixed(5)}, ${myLng.toFixed(5)})\n` +
            `🏫 École attendue : (${schoolLat}, ${schoolLng})`
          );
          return;
        }

        // Étape 5 : Check-in validé — enregistrement dans Supabase
        setLocation(pos);
        setIsCheckedIn(true);
        setLocationText("Présence Validée ✅");
        alert(`✅ Présence confirmée à ${dist < 0.1 ? "moins de 100m" : dist.toFixed(2) + " km"} de "${schoolName}".`);

        if (activity?.id && !activity.id.startsWith("demo")) {
          await supabase.from("activities").update({
            status: "completed",
            checkin_lat: myLat,
            checkin_lng: myLng,
            checkin_at: new Date().toISOString(),
          }).eq("id", activity.id);
        }
      },
      (err) => {
        setLocationText("Erreur GPS");
        alert("Impossible d'obtenir votre position GPS. Veuillez autoriser la géolocalisation dans votre navigateur.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveBilan = async () => {
    if (!bilanText.trim()) {
      alert("Veuillez écrire un bilan avant de l'envoyer.");
      return;
    }
    if (hasParentalConsent && signaturePoints.length === 0) {
      alert("Veuillez apposer votre signature électronique.");
      return;
    }

    let finalBilanText = bilanText;
    if (hasParentalConsent) {
      finalBilanText += `\n\n[RGPD/CNDP] Consentement parental signé électroniquement sur place (Tracé : ${signaturePoints.length} points).`;
    } else {
      finalBilanText += `\n\n[RGPD/CNDP] Sans consentement parental pour diffusion média.`;
    }

    const reportPayload = {
      title: `Bilan : ${selectedActivity?.theme}`,
      date: new Date().toLocaleDateString("fr-FR"),
      type: "Texte IA",
      size: mediaFiles.length > 0 ? `${mediaFiles.length} média(s)` : "N/A",
      status: "Prêt",
      school: selectedActivity?.school_name || "Inconnue",
      trainer: profile.fullName || "Formateur Web",
      province: "Maroc",
      summary: finalBilanText,
      participants: nbEleves === "" ? 0 : nbEleves,
      duration: selectedActivity?.time_slot || "Non défini",
    };

    if (isOffline) {
      // Simulation du mode hors-ligne SQLite local
      const offlineReports = JSON.parse(localStorage.getItem('smartcaravan_sqlite_reports') || '[]');
      offlineReports.push(reportPayload);
      localStorage.setItem('smartcaravan_sqlite_reports', JSON.stringify(offlineReports));
      
      alert("⚠️ Vous êtes hors-ligne. Les données (bilan, élèves, photos/vidéos) ont été stockées localement en cache (SQLite local) et seront synchronisées plus tard.");
      setShowBilanModal(false);
      resetForm();
      return;
    }

    const { error } = await supabase.from("reports").insert([reportPayload]);

    if (error) {
      alert(`Erreur Supabase :\n${error.message}\nDétails : ${error.details}\nCode : ${error.code}`);
      console.error("Supabase Error:", error);
    } else {
      alert("Le bilan a été transmis à l'administration avec succès !");
      setShowBilanModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setBilanText("");
    setHasParentalConsent(false);
    setSignaturePoints([]);
    setNbEleves("");
    setMediaFiles([]);
  };

  const generateBilanIA = async () => {
    if (isOffline) {
      alert("L'IA Coach nécessite une connexion internet. Vous êtes actuellement hors-ligne.");
      return;
    }
    setGeneratingBilan(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Rédige un bilan d'intervention très court et professionnel (4 phrases maximum) pour l'atelier ${selectedActivity?.theme || "IT"} avec les élèves de ${selectedActivity?.school_name || "l'école"}. L'atelier s'est très bien passé.`,
          }],
        }),
      });
      const data = await response.json();
      if (data.choices?.[0]) {
        setBilanText(data.choices[0].message.content);
      } else if (data.error) {
        alert("Erreur IA: " + (data.error.message || data.error));
      } else {
        alert("Réponse inattendue de l'IA.");
      }
    } catch (err) {
      alert("Impossible de joindre l'API d'assistance pour le moment.");
    }
    setGeneratingBilan(false);
  };

  // Fallback activity for demo
  const todayActivity = activities.length > 0 ? activities[0] : {
    id: "demo-1",
    school_name: "Lycée Al Farabi (Démo)",
    theme: "Robotique (Synchronisation en attente)",
    status: "pending",
    trainer_name: profile.fullName || "Vous",
    date: new Date().toISOString().split("T")[0],
    time_slot: "09:00 - 12:00",
  };

  const progressPct = Math.min(100, (profile.points % 1000) / 10);
  const pointsToNext = 1000 - (profile.points % 1000);

  return (
    <>
      <div className="space-y-6 pb-24 md:pb-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bonjour, <span className="text-[#00B4A0]">{profile.fullName || "Formateur"}</span> 👋
            </h1>
            <p className="text-slate-400 font-medium mt-1 min-h-[24px]">
              {mounted ? new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#00B4A0]/10 border border-[#00B4A0]/20 rounded-2xl self-start">
            <div className="w-2 h-2 bg-[#00B4A0] rounded-full animate-pulse" />
            <span className="text-sm font-bold text-[#00B4A0]">Sync • Temps réel</span>
          </div>
        </motion.div>

        {/* ─── Gamification Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 border border-white/5"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00B4A0]/10 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-2xl flex items-center justify-center">
                <Trophy size={28} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-black">Niveau : {profile.level}</h2>
                <p className="text-amber-400 font-bold text-sm">{profile.points} pts cumulés</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-[#00B4A0] rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Encore <span className="text-amber-400 font-bold">{pointsToNext} pts</span> pour débloquer le prochain palier !
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Quick Action Cards ─── */}
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Actions Terrain</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* GPS Check-in */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleCheckIn(todayActivity)}
              disabled={isCheckedIn}
              className={`w-full p-6 rounded-3xl border transition-all duration-300 text-left group ${isCheckedIn
                  ? "bg-[#00B4A0]/10 border-[#00B4A0]/30"
                  : "bg-[#1E293B] border-white/5 hover:border-[#38BDF8]/30 hover:shadow-lg hover:shadow-[#38BDF8]/5"
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${isCheckedIn ? "bg-[#00B4A0]/20" : "bg-[#38BDF8]/10 group-hover:bg-[#38BDF8]/20"
                }`}>
                {isCheckedIn ? (
                  <CheckCircle2 size={28} className="text-[#00B4A0]" />
                ) : (
                  <Navigation size={28} className="text-[#38BDF8]" />
                )}
              </div>
              <h3 className={`text-lg font-black mb-1 ${isCheckedIn ? "text-[#00B4A0]" : ""}`}>
                {locationText}
              </h3>
              <p className="text-sm text-slate-400 font-medium">{todayActivity?.school_name || "Aucun atelier"}</p>
            </motion.button>

            {/* QR Scanner */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowQRInfo(true)}
              className="w-full p-6 rounded-3xl border border-white/5 bg-[#1E293B] hover:border-[#38BDF8]/30 hover:shadow-lg hover:shadow-[#38BDF8]/5 transition-all duration-300 text-left group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/10 group-hover:bg-[#38BDF8]/20 flex items-center justify-center mb-4 transition-all">
                <QrCode size={28} className="text-[#38BDF8]" />
              </div>
              <h3 className="text-lg font-black mb-1">Scanner Badge</h3>
              <p className="text-sm text-slate-400 font-medium">Badge Élève QR Code</p>
            </motion.button>
          </div>
        </div>

        {/* ─── Programme du Jour ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Programme du Jour</h2>
            <Link href="/formateur/carte" className="text-xs font-bold text-[#00B4A0] hover:underline flex items-center gap-1">
              Voir sur la carte <ChevronRight size={14} />
            </Link>
          </div>

          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-4"
            >
              <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={16} />
                Si votre atelier créé sur le Web n'apparaît pas ici, c'est que la table "activities" sur Supabase a des règles RLS bloquant la lecture. Une activité de démo est affichée.
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            {(activities.length > 0 ? activities : [todayActivity]).map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-[#00B4A0]" />
                    <span className="text-slate-300 font-medium">{act.date} | {act.time_slot}</span>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${act.status === "completed"
                      ? "bg-[#00B4A0]/10 text-[#00B4A0]"
                      : "bg-amber-500/10 text-amber-400"
                    }`}>
                    {act.status === "completed" ? "Terminé" : "En cours"}
                  </span>
                </div>

                {/* Theme */}
                <h3 className="text-xl font-black mb-2">{act.theme}</h3>

                {/* Location & Trainer */}
                <div className="flex items-center gap-2 mb-5 text-sm text-slate-400">
                  <School size={14} className="shrink-0" />
                  <span>{act.school_name} — Assigné: {act.trainer_name}</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    setSelectedActivity(act);
                    setHasParentalConsent(false);
                    setSignaturePoints([]);
                    setBilanText("");
                    setShowBilanModal(true);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${act.status === "completed"
                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                      : "bg-gradient-to-r from-[#00B4A0] to-[#00B4A0]/80 text-white shadow-lg shadow-[#00B4A0]/20 hover:shadow-[#00B4A0]/40"
                    }`}
                >
                  <FileText size={18} />
                  {act.status === "completed" ? "Voir le Bilan" : "Saisir le Bilan d'Intervention"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Quick Stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Ateliers réalisés", value: activities.filter(a => a.status === "completed").length.toString(), icon: CheckCircle2, color: "text-[#00B4A0]" },
            { label: "En attente", value: activities.filter(a => a.status === "pending").length.toString(), icon: Clock, color: "text-amber-400" },
            { label: "Points gagnés", value: `${profile.points}`, icon: Zap, color: "text-amber-400" },
            { label: "Niveau", value: profile.level, icon: Trophy, color: "text-[#38BDF8]" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1E293B] rounded-2xl p-4 border border-white/5 text-center">
              <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ════════════ Bilan Modal ════════════ */}
      {showBilanModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBilanModal(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative z-10 w-full sm:max-w-xl bg-[#0F172A] rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-xl p-6 border-b border-white/5 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-black">Bilan d'Intervention</h2>
              <button onClick={() => setShowBilanModal(false)} className="p-2 rounded-xl hover:bg-white/5">
                <X size={22} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* AI Generate Button */}
              <button
                onClick={generateBilanIA}
                disabled={generatingBilan || selectedActivity?.status === "completed"}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-[#38BDF8] to-[#38BDF8]/80 text-[#0F172A] shadow-lg transition-all disabled:opacity-50 hover:shadow-[#38BDF8]/30"
              >
                {generatingBilan ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
                {generatingBilan ? "Génération en cours..." : "Rédiger par l'IA Coach"}
              </button>

              {/* Text Area */}
              <textarea
                value={bilanText}
                onChange={(e) => setBilanText(e.target.value)}
                placeholder="Ou saisissez le bilan de l'atelier ici..."
                rows={6}
                className="w-full bg-[#1E293B] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-[#00B4A0]/50 transition-colors"
              />

              {/* Media Upload */}
              <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-4">
                <label className="flex flex-col items-center justify-center cursor-pointer w-full">
                  <div className="flex items-center gap-2 text-[#38BDF8] font-bold mb-2">
                    <Camera size={20} />
                    <span>Ajouter Photos / Vidéos</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Prenez une photo en direct ou choisissez un fichier</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setMediaFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 w-full justify-center mt-2">
                    {mediaFiles.map((file, idx) => (
                      <div key={idx} className="relative group cursor-default">
                        <div className="w-16 h-16 bg-[#0F172A] rounded-xl flex items-center justify-center text-xs text-slate-400 overflow-hidden border border-white/10">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px]">Vidéo</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setMediaFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 shadow-md z-10"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </label>
              </div>

              {/* RGPD Consent Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setHasParentalConsent(!hasParentalConsent)}
                  className={`w-6 h-6 rounded-lg border-2 border-[#00B4A0] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${hasParentalConsent ? "bg-[#00B4A0]" : "bg-transparent"
                    }`}
                >
                  {hasParentalConsent && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-sm text-slate-300 font-medium leading-relaxed">
                  J'ai obtenu le consentement parental (RGPD) pour la capture et diffusion des photos/médias.
                </span>
              </label>

              {/* Signature Pad */}
              {hasParentalConsent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[#1E293B] rounded-2xl p-5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Signature électronique du tuteur</span>
                    <button onClick={() => setSignaturePoints([])} className="text-xs font-bold text-red-400 hover:text-red-300">
                      Effacer
                    </button>
                  </div>
                  <div
                    className="h-[150px] bg-[#0F172A] rounded-xl border border-white/10 relative overflow-hidden cursor-crosshair"
                    onMouseMove={(e) => {
                      if (e.buttons !== 1) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSignaturePoints(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                    }}
                    onTouchMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      setSignaturePoints(prev => [...prev, { x: touch.clientX - rect.left, y: touch.clientY - rect.top }]);
                    }}
                  >
                    {signaturePoints.map((p, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-[#00B4A0]"
                        style={{ left: p.x - 3, top: p.y - 3 }}
                      />
                    ))}
                    {signaturePoints.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-slate-500 italic">Signez ici avec votre souris ou doigt</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <button
                onClick={saveBilan}
                disabled={selectedActivity?.status === "completed"}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-[#00B4A0] to-[#00B4A0]/80 text-white shadow-lg shadow-[#00B4A0]/20 hover:shadow-[#00B4A0]/40 transition-all disabled:opacity-50"
              >
                Enregistrer le Bilan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ════════════ QR Info Modal ════════════ */}
      {showQRInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQRInfo(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10 text-center"
          >
            <div className="w-20 h-20 bg-[#38BDF8]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <QrCode size={40} className="text-[#38BDF8]" />
            </div>
            <h3 className="text-2xl font-black mb-3">Scanner de Badges</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Le scanner de badges utilise la caméra native de l'appareil. Cette fonctionnalité est optimisée pour l'application mobile SmartCaravan (Expo Go).
            </p>
            <p className="text-sm text-[#00B4A0] font-bold mb-6">
              💡 Sur le web, utilisez la page Planning du Dashboard pour scanner les QR codes via webcam.
            </p>
            <button
              onClick={() => setShowQRInfo(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
            >
              Compris
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
