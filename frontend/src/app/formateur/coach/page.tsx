"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormateurCoachPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/formateur"); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-400 text-sm">Redirection...</p>
    </div>
  );
}
