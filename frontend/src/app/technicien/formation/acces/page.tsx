"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School, Users, Key, CheckCircle2, Loader2,
  Download, Eye, EyeOff, Printer, Copy, AlertTriangle, Sparkles
} from "lucide-react";

interface Ecole {
  id: string;
  nom: string;
  province: string;
  nbEleves: number;
  formateurs: string[];
}

interface CreatedAccount {
  ecoleId: string;
  email: string;
  password: string;
  alreadyExists?: boolean;
}

const MOCK_ECOLES_ASSIGNEES: Ecole[] = [
  { id: "E001", nom: "Lycée Bamou", province: "Tinghir", nbEleves: 420, formateurs: ["Ahmed Alami", "Fatima Bensalem", "Youssef Chraibi", "Khadija Dahbi"] },
  { id: "E002", nom: "Collège Ibn Sina", province: "Tinghir", nbEleves: 280, formateurs: ["Mohammed El Fassi", "Asmaa Fathi", "Khalid Guessous", "Zineb Hamid"] },
  { id: "E003", nom: "Lycée Hassan II", province: "Zagora", nbEleves: 350, formateurs: ["Rachid Idrissi", "Meryem Jalil", "Omar Kadiri", "Laila Lahbabi"] },
  { id: "E004", nom: "Lycée Moulay Ali Cherif", province: "Midelt", nbEleves: 310, formateurs: ["Hassan Mansouri", "Sara Naciri", "Amine Oufkir", "Houda Qanit"] },
  { id: "E005", nom: "Collège Al Massira", province: "Zagora", nbEleves: 195, formateurs: ["Bilal Rahmani", "Nadia Saidi", "Karim Tahiri", "Soumia Umayyad"] },
];

export default function AccesEcolesPage() {
  const [ecoles] = useState<Ecole[]>(MOCK_ECOLES_ASSIGNEES);
  const [accounts, setAccounts] = useState<Record<string, CreatedAccount>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  const createAccount = async (ecole: Ecole) => {
    setLoading(ecole.id);
    try {
      const res = await fetch("/api/create-formateur-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ecoleNom: ecole.nom, province: ecole.province }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erreur: ${data.error}`);
      } else {
        setAccounts(prev => ({ ...prev, [ecole.id]: { ecoleId: ecole.id, email: data.email, password: data.password, alreadyExists: data.alreadyExists } }));
      }
    } catch {
      alert("Erreur de connexion au serveur.");
    } finally {
      setLoading(null);
    }
  };

  const createAllAccounts = async () => {
    setGeneratingAll(true);
    for (const ecole of ecoles) {
      if (!accounts[ecole.id]) {
        await createAccount(ecole);
        await new Promise(r => setTimeout(r, 500)); // small delay between requests
      }
    }
    setGeneratingAll(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const printAll = () => {
    const lines = Object.entries(accounts).map(([id, acc]) => {
      const ecole = ecoles.find(e => e.id === id);
      return `${ecole?.nom} (${ecole?.province})\n  Login: ${acc.email}\n  Mot de passe: ${acc.password}\n`;
    }).join("\n");
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px"><h2>SmartCaravan — Accès Formateurs</h2>\n\n${lines}</pre>`);
      win.print();
    }
  };

  const createdCount = Object.keys(accounts).length;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Accès Formateurs par École</h1>
          <p className="text-slate-400 text-sm mt-1">
            1 compte partagé par école · 4 formateurs utilisent le même login
          </p>
        </div>
        <div className="flex gap-3">
          {createdCount > 0 && (
            <button onClick={printAll}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl font-bold text-sm transition-all">
              <Printer size={16} /> Imprimer tout
            </button>
          )}
          <button
            onClick={createAllAccounts}
            disabled={generatingAll}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1F3C6D] to-[#5E9FA3] hover:from-[#A4C639] hover:to-[#5E9FA3] px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
          >
            {generatingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generatingAll ? "Génération en cours…" : `Générer tous les accès (${ecoles.length})`}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-300">Progression</p>
          <p className="text-sm font-black text-[#A4C639]">{createdCount} / {ecoles.length} écoles</p>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#A4C639] to-[#5E9FA3] rounded-full"
            animate={{ width: `${ecoles.length > 0 ? (createdCount / ecoles.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Explanation box */}
      <div className="bg-[#FDB813]/5 border border-[#FDB813]/20 rounded-2xl p-5 flex gap-4">
        <AlertTriangle className="text-[#FDB813] shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-[#FDB813] block mb-1">Comment ça fonctionne ?</strong>
          Un seul compte est créé par école. Les 4 formateurs de cette école se connectent tous avec
          <strong> le même email et mot de passe</strong> sur <code className="text-[#A4C639] bg-white/5 px-1 rounded">/formateur</code>.
          Le technicien remet la fiche imprimée au directeur lors de l&apos;installation.
        </div>
      </div>

      {/* Ecoles list */}
      <div className="space-y-4">
        {ecoles.map((ecole) => {
          const account = accounts[ecole.id];
          const isLoading = loading === ecole.id;
          const isCreated = !!account;
          const showPwd = showPassword[ecole.id];

          return (
            <motion.div
              key={ecole.id}
              layout
              className={`bg-[#1E293B] rounded-2xl border transition-all ${isCreated ? "border-[#A4C639]/20" : "border-white/5"}`}
            >
              {/* School header */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCreated ? "bg-[#A4C639]/15" : "bg-white/5"}`}>
                    <School size={18} className={isCreated ? "text-[#A4C639]" : "text-slate-400"} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-sm">{ecole.nom}</h3>
                    <p className="text-xs text-slate-400">{ecole.province} · {ecole.nbEleves} élèves</p>
                  </div>
                </div>

                {/* Formateurs avatars */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex -space-x-2">
                    {ecole.formateurs.slice(0, 4).map((f, i) => (
                      <div key={i} title={f}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1F3C6D] to-[#5E9FA3] border-2 border-[#1E293B] flex items-center justify-center text-[9px] font-black">
                        {f.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{ecole.formateurs.length} formateurs</span>
                </div>

                {/* Action button */}
                {!isCreated ? (
                  <button
                    onClick={() => createAccount(ecole)}
                    disabled={isLoading || generatingAll}
                    className="flex items-center gap-2 bg-[#1F3C6D] hover:bg-[#A4C639] px-4 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-60 shrink-0"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                    {isLoading ? "Création…" : "Générer accès"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#A4C639] shrink-0">
                    <CheckCircle2 size={16} /> {account.alreadyExists ? "Déjà existant" : "Créé ✓"}
                  </span>
                )}
              </div>

              {/* Credentials card (shown after creation) */}
              <AnimatePresence>
                {isCreated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-5 space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Users size={12} /> Identifiants à remettre aux formateurs
                      </p>

                      {/* Email */}
                      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                          <p className="text-sm font-mono font-bold text-slate-200 truncate">{account.email}</p>
                        </div>
                        <button onClick={() => copyToClipboard(account.email)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Copier">
                          <Copy size={14} className="text-slate-400" />
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Mot de passe</p>
                          <p className="text-sm font-mono font-bold text-[#FDB813] tracking-widest">
                            {showPwd ? account.password : "••••-••••"}
                          </p>
                        </div>
                        <button onClick={() => setShowPassword(prev => ({ ...prev, [ecole.id]: !showPwd }))}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          {showPwd ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-slate-400" />}
                        </button>
                        <button onClick={() => copyToClipboard(account.password)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Copy size={14} className="text-slate-400" />
                        </button>
                      </div>

                      {/* Formateurs list */}
                      <div className="bg-[#A4C639]/5 border border-[#A4C639]/10 rounded-xl p-3">
                        <p className="text-[10px] text-[#A4C639] font-bold uppercase mb-2">Formateurs de cette école</p>
                        <div className="grid grid-cols-2 gap-1">
                          {ecole.formateurs.map((f, i) => (
                            <p key={i} className="text-xs text-slate-300">· {f}</p>
                          ))}
                        </div>
                      </div>

                      {/* Print single */}
                      <button
                        onClick={() => {
                          const win = window.open("", "_blank");
                          if (win) {
                            win.document.write(`
                              <html><body style="font-family:monospace;padding:40px;max-width:400px">
                              <h2 style="color:#1F3C6D">SmartCaravan — Accès Formateurs</h2>
                              <hr/>
                              <h3>${ecole.nom}</h3>
                              <p><b>Province:</b> ${ecole.province}</p>
                              <p><b>Login:</b> ${account.email}</p>
                              <p><b>Mot de passe:</b> ${account.password}</p>
                              <hr/>
                              <p><b>Formateurs:</b></p>
                              <ul>${ecole.formateurs.map(f => `<li>${f}</li>`).join("")}</ul>
                              <hr/>
                              <p style="font-size:11px;color:#888">Connectez-vous sur /formateur avec ces identifiants</p>
                              </body></html>
                            `);
                            win.print();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-[#5E9FA3]/40 hover:text-[#5E9FA3] py-2.5 rounded-xl text-xs font-bold transition-all text-slate-400"
                      >
                        <Printer size={14} /> Imprimer la fiche de cette école
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Download all CSV */}
      {createdCount > 0 && (
        <button
          onClick={() => {
            const csv = ["École,Province,Email,Mot de passe",
              ...Object.entries(accounts).map(([id, acc]) => {
                const e = ecoles.find(ec => ec.id === id);
                return `"${e?.nom}","${e?.province}","${acc.email}","${acc.password}"`;
              })
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "acces-formateurs.csv"; a.click();
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#1F3C6D]/30 border border-[#1F3C6D]/40 hover:bg-[#1F3C6D] py-3.5 rounded-2xl font-bold text-sm transition-all"
        >
          <Download size={18} /> Télécharger tous les accès (CSV)
        </button>
      )}
    </div>
  );
}
