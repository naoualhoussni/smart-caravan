import { NextResponse } from "next/server";

export async function GET() {
  const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${ML_API}/analytics/provinces`, {
      next: { revalidate: 0 },
    });
    
    if (!res.ok) {
      throw new Error(`API Python a répondu avec le statut ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erreur proxy ml-provinces:", error.message);
    
    // Données de fallback si le backend IA est hors ligne (utile pour Vercel)
    return NextResponse.json({
      success: true,
      _fallback: true,
      provinces: [
        {
          province: "Tinghir",
          kpis: {
            total_ateliers: 120,
            engagement_moyen: 85.4,
            budget_total_mad: 450000,
            budget_moyen_mad: 3750,
            distance_moyenne_km: 250,
            pct_risque_eleve: 65.0
          }
        },
        {
          province: "Azilal",
          kpis: {
            total_ateliers: 90,
            engagement_moyen: 78.2,
            budget_total_mad: 320000,
            budget_moyen_mad: 3555,
            distance_moyenne_km: 180,
            pct_risque_eleve: 40.0
          }
        },
        {
          province: "Casablanca",
          kpis: {
            total_ateliers: 250,
            engagement_moyen: 62.5,
            budget_total_mad: 150000,
            budget_moyen_mad: 600,
            distance_moyenne_km: 30,
            pct_risque_eleve: 5.0
          }
        }
      ]
    });
  }
}
