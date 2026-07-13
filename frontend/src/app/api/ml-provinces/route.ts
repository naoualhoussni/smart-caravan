import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/analytics/provinces", {
      next: { revalidate: 0 },
    });
    
    if (!res.ok) {
      throw new Error(`API Python a répondu avec le statut ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erreur proxy ml-provinces:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de joindre le moteur IA" },
      { status: 500 }
    );
  }
}
