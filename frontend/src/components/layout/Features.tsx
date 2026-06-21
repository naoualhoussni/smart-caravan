"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  BrainCircuit,
  MessageSquareCode
} from "lucide-react";

const features = [
  {
    title: "Suivi GPS Live",
    description: "Localisation précise des caravanes et pointage automatique des équipes sur le terrain.",
    icon: MapPin,
    color: "bg-brand-navy",
  },
  {
    title: "Équipes Connectées",
    description: "Gestion centralisée des formateurs, coordinateurs et superviseurs en temps réel.",
    icon: Users,
    color: "bg-brand-yellow",
  },
  {
    title: "Analytique Avancée",
    description: "Tableaux de bord intelligents avec détection automatique d'anomalies par IA.",
    icon: BarChart3,
    color: "bg-brand-teal",
  },
  {
    title: "Mode Hors-ligne",
    description: "L'application mobile fonctionne partout, même sans connexion internet.",
    icon: Smartphone,
    color: "bg-brand-green",
  },
  {
    title: "Rapports par IA",
    description: "Génération automatique de rapports d'impact grâce au traitement du langage naturel.",
    icon: BrainCircuit,
    color: "bg-brand-navy",
  },
  {
    title: "Digitalisation Terrain",
    description: "Upload de photos, vidéos et signatures numériques pour une traçabilité totale.",
    icon: ShieldCheck,
    color: "bg-brand-teal",
  },
];

const Features = () => {
  return (
    <section id="caravanes" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black mb-4"
          >
            Une Technologie <span className="text-brand-teal">Au Service de l'Impact</span>
          </motion.h2>
          <p className="text-muted-foreground text-lg">
            Découvrez les outils innovants qui permettent à SmartCaravan de piloter 
            efficacement les interventions éducatives à travers tout le pays.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-3xl bg-white dark:bg-white/5 border border-border hover:border-brand-teal/50 hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-brand-teal transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
