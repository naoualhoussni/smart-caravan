import { NextResponse } from "next/server";

/**
 * Proxy côté serveur pour l'API Python FastAPI.
 * Cet endpoint est appelé par le navigateur du client (Vercel frontend),
 * mais la vraie requête vers localhost:8000 ou NEXT_PUBLIC_ML_API_URL
 * se fait côté serveur Next.js — évitant ainsi les erreurs ERR_CONNECTION_REFUSED
 * sur le navigateur de l'utilisateur final.
 */
export async function GET() {
  const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${ML_API}/analytics/real-overview`, {
      // Cache de 60 secondes pour éviter de surcharger l'API Python
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`ML API responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ML API proxy error:", error.message);

    // Retourner des données de fallback statiques si l'API Python est hors ligne
    // Ces données sont affichées sur le dashboard quand le backend n'est pas déployé
    return NextResponse.json({
      success: true,
      _fallback: true,
      kpis: {
        caravans: 4,
        teams: 8,
        activities: 87,
        schools: 52,
      },
      recent: [
        { trainer_name: "Équipe Atlas", school_name: "Lycée Al Farabi, Ifrane", time_slot: "09:00 - 12:00" },
        { trainer_name: "Équipe Sebou", school_name: "Collège Ibn Sina, Khénifra", time_slot: "13:00 - 16:00" },
        { trainer_name: "Équipe Drâa", school_name: "École Assalam, Ouarzazate", time_slot: "08:00 - 11:00" },
        { trainer_name: "Équipe Tensift", school_name: "LPQ Moulay Rachid, Marrakech", time_slot: "10:00 - 13:00" },
      ],
    });
  }
}
