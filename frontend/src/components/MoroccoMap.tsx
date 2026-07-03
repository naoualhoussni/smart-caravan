"use client";

import { useEffect, useRef, useState } from "react";

// Province coordinates (lat/lng) for all Moroccan provinces
const PROVINCE_COORDS: Record<string, [number, number]> = {
  "tanger": [35.7595, -5.834], "tétouan": [35.578, -5.368],
  "al hoceima": [35.246, -3.930], "chefchaouen": [35.168, -5.269],
  "nador": [35.168, -2.928], "oujda": [34.688, -1.911],
  "rabat": [34.020, -6.841], "salé": [34.038, -6.800],
  "kenitra": [34.261, -6.580], "meknès": [33.895, -5.547],
  "fes": [34.033, -5.000], "fès": [34.033, -5.000],
  "ifrane": [33.533, -5.107], "midelt": [32.683, -4.733],
  "errachidia": [31.929, -4.426], "casablanca": [33.589, -7.604],
  "settat": [33.001, -7.616], "el jadida": [33.234, -8.500],
  "beni mellal": [32.337, -6.361], "azilal": [31.967, -6.567],
  "marrakech": [31.629, -7.981], "safi": [32.299, -9.237],
  "zagora": [30.332, -5.838], "tinghir": [31.514, -5.530],
  "ouarzazate": [30.919, -6.894], "agadir": [30.427, -9.598],
  "agadir-ida-ou-tanane": [30.427, -9.598], "taroudant": [30.473, -8.877],
  "guelmim": [28.987, -10.057], "laayoune": [27.160, -13.203],
  "dakhla": [23.690, -15.937], "tata": [29.745, -7.972],
  "khouribga": [32.883, -6.900], "tanger-assilah": [35.759, -5.834],
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
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // [PARTIE 1] Initialisation de la carte centrée sur le Maroc par défaut
  useEffect(() => {
    let L: any;
    let initDone = false;

    const initMap = async () => {
      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Guard: don't re-initialize and ensure the container exists in the DOM
      if (mapRef.current || !mapContainerRef.current) return;

      // Patch the default icon BEFORE creating the map to avoid _initIcon crash
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [31.5, -6.5],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/'>CARTO</a>",
        subdomains: "abcd",
        maxZoom: 18,
      }).addTo(map);

      // [CRITICAL FIX] Defer all marker operations until after Leaflet has fully
      // initialized its internal DOM panes (markerPane, shadowPane, etc.).
      // Calling marker.addTo(map) synchronously after L.map() can crash because
      // Leaflet's _initPanes() hasn't run yet in some environments (Next.js/SSR).
      setTimeout(() => {
        if (!mapRef.current || initDone) return;
        initDone = true;
        map.invalidateSize(); // Ensure map container dimensions are computed
        addMarkers(L, map, caravanes);
        locateUser(L, map);
      }, 100);
    };

    initMap();
    return () => {
      initDone = true; // Prevent deferred callbacks from running after unmount
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // [PARTIE 3] Mise à jour des marqueurs caravanes quand les données changent
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current) return;
      const L = await import("leaflet");
      if (!mapRef.current || !mapRef.current._panes) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      addMarkers(L, mapRef.current, caravanes);
    };
    updateMarkers();
  }, [caravanes]);

  // [LOGIQUE DE GÉOLOCALISATION]
  // On utilise navigator.geolocation.getCurrentPosition (API navigateur standard)
  // Les coordonnées retournées sont issues du GPS du téléphone ou de la WiFi/IP sur desktop
  const locateUser = async (L: any, map: any) => {
    if (!("geolocation" in navigator)) return;
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Guard: check if map still exists and has panes (prevent appendChild crash if unmounted)
        if (!mapRef.current || !mapRef.current._panes) return;

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy; // précision en mètres

        setUserCoords([lat, lng]);
        setGpsStatus("ok");

        // Supprimer l'ancien marqueur utilisateur s'il existe
        if (userMarkerRef.current) { userMarkerRef.current.remove(); }
        if (userCircleRef.current) { userCircleRef.current.remove(); }

        // [MARQUEUR POSITION FORMATEUR] — Point bleu avec animation pulse
        const userIcon = L.divIcon({
          html: `
            <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
              <div style="
                position:absolute;width:24px;height:24px;border-radius:50%;
                background:rgba(56,189,248,0.3);animation:pulse 2s infinite;
              "></div>
              <div style="
                width:12px;height:12px;border-radius:50%;
                background:#38BDF8;border:2px solid white;
                box-shadow:0 0 0 2px #0EA5E9;z-index:1;
              "></div>
            </div>
          `,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const userMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;min-width:160px;">
              <p style="font-weight:900;color:#0284C7;margin:0 0 4px;font-size:13px;">📍 Votre position</p>
              <p style="color:#64748b;margin:0;font-size:11px;">Lat: ${lat.toFixed(5)}</p>
              <p style="color:#64748b;margin:0;font-size:11px;">Lng: ${lng.toFixed(5)}</p>
              <p style="color:#94a3b8;margin:4px 0 0;font-size:10px;">Précision: ±${Math.round(accuracy)}m</p>
            </div>
          `);

        // [CERCLE DE PRÉCISION] — Montre la zone d'incertitude GPS
        const circle = L.circle([lat, lng], {
          radius: accuracy,
          color: "#38BDF8",
          fillColor: "#38BDF8",
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);

        userMarkerRef.current = userMarker;
        userCircleRef.current = circle;

        // [CENTRAGE AUTOMATIQUE] — La carte se centre sur le formateur
        map.setView([lat, lng], 13);
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocateMe = async () => {
    if (!mapRef.current) return;
    const L = await import("leaflet");
    locateUser(L, mapRef.current);
  };

  const addMarkers = (L: any, map: any, caravanesList: MoroccoMapProps["caravanes"]) => {
    const newMarkers: any[] = [];
    caravanesList.forEach((caravan) => {
      const coords = getCoords(caravan.province);
      if (!coords) return;
      const isActive = caravan.status === "ACTIVE";
      const iconHtml = `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          ${isActive ? `<div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(0,180,160,0.25);animation:pulse 2s infinite;"></div>` : ""}
          <div style="width:18px;height:18px;border-radius:50%;background:${isActive ? "#00B4A0" : "#94a3b8"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);z-index:1;"></div>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [36, 36], iconAnchor: [18, 18] });
      const startDate = caravan.start_date ? new Date(caravan.start_date).toLocaleDateString("fr-FR") : "Date inconnue";
      const marker = L.marker(coords, { icon }).addTo(map).bindPopup(`
        <div style="font-family:system-ui;min-width:160px;">
          <p style="font-weight:900;color:#0B2B5B;margin:0 0 4px;font-size:14px;">${caravan.name}</p>
          <p style="color:#64748b;margin:0 0 6px;font-size:12px;">📍 ${caravan.province}</p>
          <p style="color:#64748b;margin:0 0 6px;font-size:12px;">📅 Début : ${startDate}</p>
          <span style="background:${isActive ? "rgba(0,180,160,0.12)" : "#f1f5f9"};color:${isActive ? "#00B4A0" : "#64748b"};font-size:10px;font-weight:800;padding:2px 8px;border-radius:100px;text-transform:uppercase;">${caravan.status}</span>
        </div>
      `);
      newMarkers.push(marker);
    });
    markersRef.current = newMarkers;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 360 }}>
      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.8); opacity: 0; } }
        .leaflet-popup-content-wrapper { border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* [BOUTON MA POSITION] — Permet de recentrer la carte sur le formateur */}
      <button
        onClick={handleLocateMe}
        title="Centrer sur ma position"
        className="absolute bottom-4 right-4 z-[1000] bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
      >
        {gpsStatus === "loading" ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <span>📍</span>
        )}
        {gpsStatus === "ok" && userCoords
          ? `${userCoords[0].toFixed(3)}, ${userCoords[1].toFixed(3)}`
          : gpsStatus === "error"
          ? "GPS indisponible"
          : "Ma position"}
      </button>
    </div>
  );
}
