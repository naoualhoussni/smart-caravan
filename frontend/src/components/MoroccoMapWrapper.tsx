"use client";

import dynamic from "next/dynamic";

const MoroccoMap = dynamic(() => import("./MoroccoMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center gap-3"
      style={{ height: 360 }}
    >
      <div className="w-6 h-6 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-bold text-slate-400">Chargement de la carte...</span>
    </div>
  ),
});

export default MoroccoMap;
