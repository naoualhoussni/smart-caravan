"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

// Province coordinates (lat/lng) for all Moroccan provinces
const PROVINCE_COORDS: Record<string, [number, number]> = {
  // Régions du Nord
  "tanger": [35.7595, -5.834],
  "tétouan": [35.578, -5.368],
  "al hoceima": [35.246, -3.930],
  "chefchaouen": [35.168, -5.269],
  "nador": [35.168, -2.928],
  "oujda": [34.688, -1.911],

  // Centre-Nord
  "rabat": [34.020, -6.841],
  "salé": [34.038, -6.800],
  "kenitra": [34.261, -6.580],
  "meknès": [33.895, -5.547],
  "fes": [34.033, -5.000],
  "fès": [34.033, -5.000],
  "ifrane": [33.533, -5.107],
  "midelt": [32.683, -4.733],
  "sefrou": [33.833, -4.833],
  "khenifra": [32.933, -5.667],
  "khénifra": [32.933, -5.667],
  "errachidia": [31.929, -4.426],

  // Côte Atlantique Centre
  "casablanca": [33.589, -7.604],
  "settat": [33.001, -7.616],
  "benslimane": [33.633, -7.117],
  "el jadida": [33.234, -8.500],
  "mohammedia": [33.686, -7.383],

  // Centre
  "beni mellal": [32.337, -6.361],
  "azilal": [31.967, -6.567],
  "khouribga": [32.883, -6.900],
  "fquih ben salah": [32.500, -6.683],

  // Marrakech & Côte Atlantique Sud
  "marrakech": [31.629, -7.981],
  "safi": [32.299, -9.237],
  "essaouira": [31.508, -9.769],
  "el kelaa des sraghna": [32.050, -7.400],
  "chichaoua": [31.533, -8.767],

  // Sud-Est (Drâa-Tafilalet)
  "zagora": [30.332, -5.838],
  "tinghir": [31.514, -5.530],
  "ouarzazate": [30.919, -6.894],

  // Souss
  "agadir": [30.427, -9.598],
  "agadir-ida-ou-tanane": [30.427, -9.598],
  "taroudant": [30.473, -8.877],
  "tiznit": [29.697, -9.731],
  "inezgane": [30.355, -9.531],

  // Guelmim
  "guelmim": [28.987, -10.057],
  "tantan": [28.438, -11.100],
  "assa-zag": [28.617, -9.433],

  // Laâyoune
  "laayoune": [27.160, -13.203],
  "boujdour": [26.125, -14.498],

  // Dakhla
  "dakhla": [23.690, -15.937],
};

function getCoords(province: string): [number, number] | null {
  const key = province?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, v] of Object.entries(PROVINCE_COORDS)) {
    const normKey = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normKey.includes(key) || key.includes(normKey)) return v;
  }
  return null;
}

interface MoroccoMapProps {
  caravanes: { name: string; province: string; status: string; start_date?: string }[];
}

export default function MoroccoMap({ caravanes }: MoroccoMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet (CSR only)
    let L: any;

    const initMap = async () => {
      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (mapRef.current || !mapContainerRef.current) return;

      // Morocco center
      const map = L.map(mapContainerRef.current, {
        center: [31.5, -6.5],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      mapRef.current = map;

      // Light tile layer (CartoDB Positron - clean, light, no dark mode)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 14,
      }).addTo(map);

      // Add markers for caravanes
      addMarkers(L, map, caravanes);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when caravanes change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current) return;
      const L = await import("leaflet");

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      addMarkers(L, mapRef.current, caravanes);
    };
    updateMarkers();
  }, [caravanes]);

  const addMarkers = (L: any, map: any, caravanesList: MoroccoMapProps["caravanes"]) => {
    const newMarkers: any[] = [];

    caravanesList.forEach((caravan) => {
      const coords = getCoords(caravan.province);
      if (!coords) return;

      const isActive = caravan.status === "ACTIVE";

      // Custom icon
      const iconHtml = `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${isActive ? `<div style="
            position: absolute;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(0,180,160,0.25);
            animation: pulse 2s infinite;
          "></div>` : ""}
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${isActive ? "#00B4A0" : "#94a3b8"};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            z-index: 1;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const startDate = caravan.start_date
        ? new Date(caravan.start_date).toLocaleDateString("fr-FR")
        : "Date inconnue";

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 160px;">
            <p style="font-weight: 900; color: #0B2B5B; margin: 0 0 4px 0; font-size: 14px;">${caravan.name}</p>
            <p style="color: #64748b; margin: 0 0 6px 0; font-size: 12px;">📍 ${caravan.province}</p>
            <p style="color: #64748b; margin: 0 0 6px 0; font-size: 12px;">📅 Début : ${startDate}</p>
            <span style="
              background: ${isActive ? "rgba(0,180,160,0.12)" : "#f1f5f9"};
              color: ${isActive ? "#00B4A0" : "#64748b"};
              font-size: 10px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 100px;
              text-transform: uppercase;
            ">${caravan.status}</span>
          </div>
        `);

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 360 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
