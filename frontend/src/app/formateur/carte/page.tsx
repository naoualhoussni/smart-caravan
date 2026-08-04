"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirection douce : /formateur/carte n'existe plus,
// on redirige vers la page principale du formateur
export default function FormateurCartePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/formateur");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-400 text-sm">Redirection...</p>
    </div>
  );
}
