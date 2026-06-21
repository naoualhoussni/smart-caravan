"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, MapPin, Calendar, MoreVertical,
  ChevronRight, X, Loader2, Users, Pencil, Trash2, Eye
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function CaravanesPage() {
  const [caravanes, setCaravanes] = useState<any[]>([]);
  const [teamsMap, setTeamsMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCaravane, setNewCaravane] = useState({ name: "", province: "", start_date: "" });
  const [selectedCaravane, setSelectedCaravane] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchCaravanes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("caravans")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setCaravanes(data);

      // Pour chaque caravane, charger les équipes rattachées
      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, name, caravan_id");
      
      if (teamsData) {
        const map: Record<string, any[]> = {};
        teamsData.forEach((t: any) => {
          if (!map[t.caravan_id]) map[t.caravan_id] = [];
          map[t.caravan_id].push(t);
        });
        setTeamsMap(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchCaravanes(); }, []);

  const handleAddCaravane = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("caravans").insert([newCaravane]);
    if (!error) {
      setShowAddModal(false);
      setNewCaravane({ name: "", province: "", start_date: "" });
      fetchCaravanes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette caravane ?")) return;
    await supabase.from("caravans").delete().eq("id", id);
    setOpenMenuId(null);
    fetchCaravanes();
  };

  const handleStatusToggle = async (caravane: any) => {
    const newStatus = caravane.status === "ACTIVE" ? "COMPLETED" : "ACTIVE";
    await supabase.from("caravans").update({ status: newStatus }).eq("id", caravane.id);
    setOpenMenuId(null);
    fetchCaravanes();
  };

  const filtered = caravanes.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.province?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-blue">Gestion des Caravanes</h1>
          <p className="text-muted-foreground font-medium mt-1">Planifiez et suivez les déploiements sur le terrain.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-blue/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Nouvelle Caravane
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une caravane ou province..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:ring-2 focus:ring-brand-green/20 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-brand-green animate-spin" size={40} />
          <p className="text-muted-foreground font-bold">Chargement des données...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-muted">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <MapPin size={40} />
          </div>
          <h3 className="text-xl font-bold text-brand-blue mb-2">Aucune caravane trouvée</h3>
          <p className="text-muted-foreground mb-8">Commencez par créer votre première caravane.</p>
          <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-brand-green text-white rounded-xl font-bold hover:shadow-lg transition-all">
            Créer maintenant
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((caravane, index) => {
            const attachedTeams = teamsMap[caravane.id] || [];
            return (
              <motion.div
                key={caravane.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[32px] p-6 border border-border shadow-sm hover:shadow-xl transition-all group relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                      caravane.status === "ACTIVE" ? "bg-brand-green/10 text-brand-green" : 
                      caravane.status === "COMPLETED" ? "bg-slate-100 text-slate-500" :
                      "bg-brand-green/10 text-brand-green"
                    )}>
                      {caravane.status || "ACTIVE"}
                    </span>

                    {/* Menu 3 points */}
                    <div className="relative" ref={openMenuId === caravane.id ? menuRef : undefined}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === caravane.id ? null : caravane.id); }}
                        className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <AnimatePresence>
                        {openMenuId === caravane.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            className="absolute right-0 top-8 z-50 bg-white border border-border rounded-2xl shadow-xl w-48 overflow-hidden"
                          >
                            <button
                              onClick={() => { setSelectedCaravane(caravane); setShowDetailModal(true); setOpenMenuId(null); }}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-brand-blue hover:bg-muted transition-colors"
                            >
                              <Eye size={16} /> Voir les détails
                            </button>
                            <button
                              onClick={() => handleStatusToggle(caravane)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-brand-green hover:bg-muted transition-colors"
                            >
                              <Pencil size={16} /> Changer statut
                            </button>
                            <button
                              onClick={() => handleDelete(caravane.id)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} /> Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-brand-blue mb-2 truncate">{caravane.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-6">
                  <MapPin size={14} className="text-brand-green" />
                  <span>Province de {caravane.province}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-2xl mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Début</p>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Calendar size={14} className="text-brand-blue" />
                      {caravane.start_date ? new Date(caravane.start_date).toLocaleDateString('fr-FR') : "—"}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Équipes</p>
                    <div className="flex items-center justify-end gap-2 font-bold text-sm text-brand-blue">
                      <Users size={14} />
                      {attachedTeams.length > 0 ? `${attachedTeams.length} équipe(s)` : "Aucune"}
                    </div>
                  </div>
                </div>

                {/* Équipes rattachées */}
                {attachedTeams.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {attachedTeams.slice(0, 2).map((t: any) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
                        <Users size={12} className="text-brand-green" /> {t.name}
                      </div>
                    ))}
                    {attachedTeams.length > 2 && (
                      <p className="text-xs text-muted-foreground pl-2">+{attachedTeams.length - 2} autre(s)…</p>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => { setSelectedCaravane(caravane); setShowDetailModal(true); }}
                  className="w-full py-3 bg-white border border-border rounded-xl font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Voir les détails
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCaravane && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-brand-blue">Détails de la Caravane</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Nom</p>
                  <p className="font-black text-brand-blue text-lg">{selectedCaravane.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-2xl">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Province</p>
                    <p className="font-bold text-brand-blue">{selectedCaravane.province}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Statut</p>
                    <span className={cn(
                      "text-xs font-black px-2 py-1 rounded-full",
                      selectedCaravane.status === "ACTIVE" ? "bg-brand-green/10 text-brand-green" : "bg-slate-100 text-slate-500"
                    )}>
                      {selectedCaravane.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Date de début</p>
                  <p className="font-bold text-brand-blue">
                    {selectedCaravane.start_date ? new Date(selectedCaravane.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                  </p>
                </div>

                {/* Équipes */}
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">
                    Équipes rattachées ({(teamsMap[selectedCaravane.id] || []).length})
                  </p>
                  {(teamsMap[selectedCaravane.id] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Aucune équipe rattachée à cette caravane.</p>
                  ) : (
                    <div className="space-y-2">
                      {(teamsMap[selectedCaravane.id] || []).map((t: any) => (
                        <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 border border-border">
                          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white text-xs font-black">
                            {t.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-brand-blue text-sm">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-brand-blue">Nouvelle Caravane</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCaravane} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue ml-1">Nom de la Caravane</label>
                  <input required type="text" placeholder="Ex: Caravane Atlas 2026"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium"
                    value={newCaravane.name} onChange={(e) => setNewCaravane({ ...newCaravane, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue ml-1">Province</label>
                  <input required type="text" placeholder="Ex: Ifrane"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium"
                    value={newCaravane.province} onChange={(e) => setNewCaravane({ ...newCaravane, province: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-brand-blue ml-1">Date de début</label>
                  <input required type="date"
                    className="w-full px-5 py-4 bg-muted/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium"
                    value={newCaravane.start_date} onChange={(e) => setNewCaravane({ ...newCaravane, start_date: e.target.value })}
                  />
                </div>
                <button type="submit"
                  className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-lg hover:shadow-2xl hover:shadow-brand-blue/30 transition-all active:scale-95 mt-4"
                >
                  Confirmer la création
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
