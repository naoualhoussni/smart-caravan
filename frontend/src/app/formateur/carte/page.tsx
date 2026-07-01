"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Locate, Layers, Info, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Schools on the map for the demo
const DEMO_MARKERS = [
  { lat: 33.5333, lng: -5.1167, name: "Lycée Al Farabi", status: "active", province: "Ifrane" },
  { lat: 33.5100, lng: -5.1300, name: "Collège Ibn Sina", status: "completed", province: "Ifrane" },
  { lat: 34.0209, lng: -6.8416, name: "Lycée Hassan II", status: "active", province: "Rabat" },
  { lat: 33.5731, lng: -7.5898, name: "Lycée Al Khawarizmi", status: "active", province: "Casablanca" },
  { lat: 31.6295, lng: -7.9811, name: "Lycée Victor Hugo", status: "completed", province: "Marrakech" },
  { lat: 30.4278, lng: -9.5981, name: "Collège Tafraout", status: "active", province: "Agadir" },
];

export default function CartePage() {
  const supabase = createClient();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS & JS for map
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      setMapLoaded(true);
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || leafletMapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Fix for Leaflet default icon error
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Initialize map centered on Morocco
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([31.7917, -7.0926], 6);

    // Add tile layer (light theme)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control in bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Custom marker icons
    const activeIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#00B4A0,#38BDF8);border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(0,180,160,0.4);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const completedIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="width:24px;height:24px;background:#64748B;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(100,116,139,0.3);display:flex;align-items:center;justify-content:center;">
        <div style="width:6px;height:6px;background:white;border-radius:50%;"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers
    DEMO_MARKERS.forEach((marker) => {
      const icon = marker.status === "active" ? activeIcon : completedIcon;
      const m = L.marker([marker.lat, marker.lng], { icon }).addTo(map);
      m.bindPopup(`
        <div style="font-family:Poppins,sans-serif;padding:4px;">
          <strong style="color:#0F172A;font-size:14px;">${marker.name}</strong><br/>
          <span style="color:#64748B;font-size:12px;">📍 ${marker.province}</span><br/>
          <span style="color:${marker.status === 'active' ? '#00B4A0' : '#94A3B8'};font-size:11px;font-weight:bold;text-transform:uppercase;">
            ${marker.status === 'active' ? '● Atelier en cours' : '● Terminé'}
          </span>
        </div>
      `);
    });

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [mapLoaded]);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      alert("Géolocalisation non disponible.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        if (leafletMapRef.current) {
          const L = (window as any).L;
          leafletMapRef.current.setView([latitude, longitude], 14);

          const userIcon = L.divIcon({
            className: "user-marker",
            html: `<div style="width:32px;height:32px;position:relative;">
              <div style="width:32px;height:32px;background:rgba(0,180,160,0.2);border-radius:50%;animation:pulse 2s infinite;"></div>
              <div style="width:14px;height:14px;background:#00B4A0;border-radius:50%;border:3px solid white;position:absolute;top:9px;left:9px;box-shadow:0 2px 8px rgba(0,180,160,0.5);"></div>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          L.marker([latitude, longitude], { icon: userIcon }).addTo(leafletMapRef.current)
            .bindPopup("<strong>Votre position actuelle</strong>");
        }
      },
      () => alert("Impossible d'obtenir votre position GPS."),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Carte GPS</h1>
          <p className="text-slate-400 font-medium mt-1">
            Visualisez votre tournée et les établissements cibles
          </p>
        </div>
        <button
          onClick={handleLocate}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00B4A0] to-[#00B4A0]/80 text-white font-bold rounded-2xl shadow-lg shadow-[#00B4A0]/20 hover:shadow-[#00B4A0]/40 transition-all self-start"
        >
          <Locate size={18} />
          Ma Position
        </button>
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-white/5"
      >
        <div
          ref={mapRef}
          className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-[#1E293B]"
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1E293B]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* GPS Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1E293B] rounded-3xl p-6 border border-white/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center">
            <Navigation size={20} className={position ? "text-[#00B4A0]" : "text-slate-500"} />
          </div>
          <div>
            <h3 className="font-black">Votre Tournée</h3>
            <p className="text-sm text-slate-400 font-medium">
              {position
                ? `Position : ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
                : "En attente de pointage GPS..."}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-[#00B4A0] to-[#38BDF8] rounded-full" />
            <span className="text-xs font-semibold text-slate-400">Atelier en cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-500 rounded-full" />
            <span className="text-xs font-semibold text-slate-400">Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00B4A0] rounded-full ring-4 ring-[#00B4A0]/20" />
            <span className="text-xs font-semibold text-slate-400">Votre position</span>
          </div>
        </div>
      </motion.div>

      {/* Schools List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Établissements sur la carte</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_MARKERS.map((marker, i) => (
            <button
              key={i}
              onClick={() => {
                if (leafletMapRef.current) {
                  leafletMapRef.current.setView([marker.lat, marker.lng], 14);
                }
              }}
              className="bg-[#1E293B] rounded-2xl p-4 border border-white/5 hover:border-[#00B4A0]/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{marker.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-[#00B4A0] shrink-0" />
                    {marker.province}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                  marker.status === "active"
                    ? "bg-[#00B4A0]/10 text-[#00B4A0]"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {marker.status === "active" ? "Actif" : "Terminé"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
