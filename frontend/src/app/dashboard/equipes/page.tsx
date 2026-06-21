"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  MoreVertical,
  ChevronRight,
  X,
  Loader2,
  Shield,
  UserPlus
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function EquipesPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [caravanes, setCaravanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", caravan_id: "" });
  const supabase = createClient();

  const [managingTeam, setManagingTeam] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "Formatrice IT" });
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const COLORS = ["bg-brand-blue", "bg-brand-green", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-slate-700"];
  // Membres chargés depuis Supabase (table profiles) + fallback simulé
  const FALLBACK_MEMBERS = [
    { id: 1, name: "Youssef Alaoui", role: "Superviseur", initials: "YA", color: "bg-brand-blue" },
    { id: 2, name: "Sara Benali", role: "Formatrice IT", initials: "SB", color: "bg-brand-green" },
    { id: 3, name: "Omar Tazi", role: "Formateur Soft Skills", initials: "OT", color: "bg-purple-500" },
    { id: 4, name: "Amina Chraibi", role: "Formatrice IT", initials: "AC", color: "bg-orange-500" },
    { id: 5, name: "Karim Idrissi", role: "Logistique", initials: "KI", color: "bg-slate-700" },
  ];
  const [availableMembers, setAvailableMembers] = useState<any[]>(FALLBACK_MEMBERS);
  const [memberSearch, setMemberSearch] = useState("");

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email || !newMember.password) return;
    setIsCreating(true);
    setSuccessMsg("");

    try {
      // 1. Créer un client secondaire pour ne pas déconnecter l'admin actuel
      const { createClient } = await import('@supabase/supabase-js');
      const secondarySupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      // 2. Créer le vrai compte Auth
      const { data, error } = await secondarySupabase.auth.signUp({
        email: newMember.email,
        password: newMember.password,
      });

      if (error) {
        alert("Erreur lors de la création : " + error.message);
        setIsCreating(false);
        return;
      }

      // 3. Sauvegarder le profil dans Supabase (table profiles)
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: newMember.name,
          role: newMember.role,
        });
      }

      // 4. (Visuel) Ajouter à la liste de l'interface
      const initials = newMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const colors = ["bg-brand-blue", "bg-brand-green", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const memberToAdd = {
        id: Date.now(),
        name: newMember.name,
        role: newMember.role,
        initials: initials,
        color: randomColor
      };

      setAvailableMembers([memberToAdd, ...availableMembers]);
      setSuccessMsg("Compte créé avec succès ! Le formateur peut se connecter sur l'app mobile.");
      
      setTimeout(() => {
        setShowInviteModal(false);
        setNewMember({ name: "", email: "", password: "", role: "Formatrice IT" });
        setSuccessMsg("");
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Erreur inattendue");
    } finally {
      setIsCreating(false);
    }
  };

  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, (string | number)[]>>({});

  const toggleMember = async (teamId: string, memberId: string | number) => {
    setTeamMembersMap(prev => {
      const current = prev[teamId] || [];
      const isRemoving = current.includes(memberId);
      
      // Si c'est un vrai membre Supabase (UUID), sauvegarder l'affectation
      if (typeof memberId === 'string') {
        supabase.from('profiles')
          .update({ team_id: isRemoving ? null : teamId })
          .eq('id', memberId)
          .then();
      }

      if (isRemoving) {
        return { ...prev, [teamId]: current.filter(id => id !== memberId) };
      } else {
        return { ...prev, [teamId]: [...current, memberId] };
      }
    });
  };

  const fetchData = async () => {
    setLoading(true);
    // Fetch teams with their caravan name
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*, caravans(name)")
      .order("created_at", { ascending: false });
    
    // Fetch caravans for the dropdown
    const { data: caravanList, error: caravanError } = await supabase
      .from("caravans")
      .select("id, name");

    if (!teamsError && teamsData) setTeams(teamsData);
    if (!caravanError && caravanList) setCaravanes(caravanList);

    // Charger les vrais membres depuis la table profiles de Supabase
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, role, team_id")
      .order("full_name", { ascending: true });

    if (profilesData && profilesData.length > 0) {
      const realMembers = profilesData.map((p: any, i: number) => ({
        id: p.id,
        name: p.full_name || "Sans nom",
        role: p.role || "Formateur",
        initials: (p.full_name || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
        color: COLORS[i % COLORS.length],
      }));
      // Fusionner : réels d'abord, puis simulés (pour la démo)
      setAvailableMembers([...realMembers, ...FALLBACK_MEMBERS]);

      // Restaurer les affectations depuis Supabase
      const assignments: Record<string, any[]> = {};
      profilesData.forEach((p: any) => {
        if (p.team_id) {
          if (!assignments[p.team_id]) assignments[p.team_id] = [];
          assignments[p.team_id].push(p.id);
        }
      });
      setTeamMembersMap(assignments);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.caravan_id) return;

    const { error } = await supabase
      .from("teams")
      .insert([newTeam]);
    
    if (!error) {
      setShowAddModal(false);
      setNewTeam({ name: "", caravan_id: "" });
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-blue dark:text-white">Gestion des Équipes</h1>
          <p className="text-muted-foreground font-medium mt-1">Organisez vos formateurs et superviseurs par caravane.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-card border border-border text-brand-blue dark:text-white px-6 py-3 rounded-2xl font-bold hover:bg-muted transition-all active:scale-95"
          >
            <UserPlus size={20} />
            Inviter un Membre
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-blue/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            Nouvelle Équipe
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Équipes</p>
          <p className="text-2xl font-black text-brand-blue dark:text-white">{teams.length}</p>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Membres Assignés</p>
          <p className="text-2xl font-black text-brand-green">
            {Object.values(teamMembersMap).reduce((acc, curr) => acc + curr.length, 0)}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une équipe..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-card border border-border rounded-2xl focus:ring-2 focus:ring-brand-green/20 outline-none transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-card border border-border rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all">
          <Filter size={18} />
          Filtrer par Caravane
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-brand-green animate-spin" size={40} />
          <p className="text-muted-foreground font-bold">Chargement des équipes...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[32px] p-20 text-center border-2 border-dashed border-muted">
           <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <Users size={40} />
           </div>
           <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">Aucune équipe créée</h3>
           <p className="text-muted-foreground mb-8">Attribuez des formateurs à des caravanes pour commencer le suivi.</p>
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-8 py-3 bg-brand-green text-white rounded-xl font-bold hover:shadow-lg transition-all"
           >
             Créer une équipe
           </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const teamMembers = teamMembersMap[team.id] || [];
            return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-card rounded-[32px] p-6 border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
                  <Shield size={24} />
                </div>
                <button className="p-1 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <h3 className="text-xl font-black text-brand-blue dark:text-white mb-2 relative z-10 truncate">{team.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-6 relative z-10">
                <MapPin size={14} className="text-brand-green" />
                <span>Rattachée à : <span className="text-brand-blue dark:text-white font-bold">{team.caravans?.name || "Non assignée"}</span></span>
              </div>

              <div className="p-4 bg-muted/30 rounded-2xl mb-6 relative z-10">
                 <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                      Membres ({teamMembers.length})
                    </p>
                    <button 
                      onClick={() => setManagingTeam(team)}
                      className="text-[10px] font-black text-brand-green hover:underline flex items-center gap-1"
                    >
                       <UserPlus size={12} /> Gérer
                    </button>
                 </div>
                 
                 {teamMembers.length === 0 ? (
                   <p className="text-xs text-muted-foreground italic">Aucun membre assigné.</p>
                 ) : (
                   <div className="flex -space-x-2">
                      {teamMembers.slice(0, 4).map((memberId) => {
                        const member = availableMembers.find(m => m.id === memberId);
                        if (!member) return null;
                        return (
                          <div key={member.id} title={member.name} className={`w-8 h-8 rounded-full border-2 border-white dark:border-card ${member.color} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>
                            {member.initials}
                          </div>
                        );
                      })}
                      {teamMembers.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                          +{teamMembers.length - 4}
                        </div>
                      )}
                   </div>
                 )}
              </div>

              <button className="w-full py-3 bg-white dark:bg-transparent border border-border rounded-xl font-bold text-brand-blue dark:text-white hover:bg-brand-blue hover:text-white dark:hover:bg-brand-blue transition-all flex items-center justify-center gap-2 group/btn relative z-10">
                Voir l'activité
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )})}
        </div>
      )}

      {/* Add Team Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-card w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative z-10 border border-border"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-brand-blue dark:text-white">Nouvelle Équipe</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleAddTeam} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Nom de l'Équipe</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Équipe Atlas Sud"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-transparent focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Assigner à une Caravane</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-transparent focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium appearance-none"
                    value={newTeam.caravan_id}
                    onChange={(e) => setNewTeam({ ...newTeam, caravan_id: e.target.value })}
                  >
                    <option value="">Sélectionner une caravane...</option>
                    {caravanes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-lg hover:shadow-2xl hover:shadow-brand-blue/30 transition-all active:scale-95 mt-4"
                >
                  Créer l'équipe
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Members Modal */}
      <AnimatePresence>
        {managingTeam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setManagingTeam(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-card w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative z-10 border border-border flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black text-brand-blue dark:text-white">Membres</h2>
                <button onClick={() => setManagingTeam(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                Assignez des collaborateurs à <span className="font-bold text-brand-blue dark:text-white">{managingTeam.name}</span>
              </p>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un formateur..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-transparent focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-sm"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {availableMembers
                  .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.role.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map((member) => {
                  const isAssigned = (teamMembersMap[managingTeam.id] || []).includes(member.id);
                  return (
                    <div 
                      key={member.id} 
                      onClick={() => toggleMember(managingTeam.id, member.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isAssigned 
                          ? "border-brand-green bg-brand-green/5" 
                          : "border-border bg-white dark:bg-card hover:border-brand-blue/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm ${member.color}`}>
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-bold text-brand-blue dark:text-white text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isAssigned ? "border-brand-green bg-brand-green text-white" : "border-muted-foreground/30 text-transparent"
                      }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 mt-2 border-t border-border">
                <button 
                  onClick={() => setManagingTeam(null)}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black hover:shadow-xl hover:shadow-brand-blue/30 transition-all active:scale-95"
                >
                  Terminer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-card w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative z-10 border border-border"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-brand-blue dark:text-white">Inviter un Membre</h2>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-6">
                {successMsg && (
                  <div className="p-4 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-2xl font-bold text-center">
                    {successMsg}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Nom Complet</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Ahmed Alaoui"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-brand-blue dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Adresse Email Professionnelle</label>
                  <input 
                    required
                    type="email" 
                    placeholder="ahmed.alaoui@smartcaravan.ma"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-brand-blue dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Mot de passe temporaire</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Mot de passe initial pour l'app mobile"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-brand-blue dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue dark:text-white ml-1">Rôle</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium appearance-none text-brand-blue dark:text-white"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  >
                    <option value="Formatrice IT" className="dark:bg-slate-900">Formateur IT</option>
                    <option value="Formateur Soft Skills" className="dark:bg-slate-900">Formateur Soft Skills</option>
                    <option value="Superviseur" className="dark:bg-slate-900">Superviseur</option>
                    <option value="Logistique" className="dark:bg-slate-900">Logistique</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex justify-center items-center py-5 bg-brand-green text-white rounded-[24px] font-black text-lg hover:shadow-2xl hover:shadow-brand-green/30 transition-all active:scale-95 mt-4 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="animate-spin mr-2" size={24} /> : "Créer le compte"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
