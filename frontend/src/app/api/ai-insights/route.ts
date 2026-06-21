// trigger hot reload
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

// Initialisation Supabase côté serveur (service role pour bypasser RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    // ── 1. Collecter les données réelles depuis Supabase ──────────────────
    const [caravansRes, activitiesRes, reportsRes, teamsRes] = await Promise.all([
      supabase.from("caravans").select("*").order("created_at", { ascending: false }),
      supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("teams").select("*"),
    ]);

    const caravans   = caravansRes.data   ?? [];
    const activities = activitiesRes.data ?? [];
    const reports    = reportsRes.data    ?? [];
    const teams      = teamsRes.data      ?? [];

    // ── 2. Construire un résumé compact des données pour Groq ─────────────
    const dataSummary = {
      caravans_total:    caravans.length,
      caravans_active:   caravans.filter(c => c.status === "ACTIVE").length,
      caravans_planned:  caravans.filter(c => c.status === "PLANNED").length,
      caravans_completed:caravans.filter(c => c.status === "COMPLETED").length,
      caravans_list:     caravans.slice(0, 5).map(c => ({
        name: c.name, province: c.province, status: c.status, start_date: c.start_date,
      })),
      teams_total:       teams.length,
      activities_total:  activities.length,
      activity_types:    activities.reduce((acc: Record<string, number>, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1; return acc;
      }, {}),
      reports_total:     reports.length,
    };

    // ── 3. Appel Groq (Llama 3 70B) ───────────────────────────────────────
    const prompt = `
Tu es un analyste expert de la plateforme SmartCaravan, une initiative marocaine qui organise des caravanes éducatives dans les zones rurales pour enseigner la programmation informatique aux élèves (Scratch, Python, Arduino).

Voici les données réelles de la base de données SmartCaravan au moment de cette analyse :
${JSON.stringify(dataSummary, null, 2)}

Analyse ces données et génère EXACTEMENT 3 insights pertinents et actionnables pour le coordinateur de la caravane.
Chaque insight doit être basé sur les données réelles fournies.

Réponds UNIQUEMENT en JSON valide avec ce format exact :
[
  { "text": "...", "type": "warning" },
  { "text": "...", "type": "success" },
  { "text": "...", "type": "info" }
]

Où "type" est l'un des : "warning" (alerte/problème), "success" (bonne performance), "info" (observation neutre).
Les insights doivent être en français, concis (max 2 phrases), et très pratiques pour le coordinateur.
Ne retourne que le JSON, pas d'explication.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "[]";

    // ── 4. Parser la réponse JSON de Groq ─────────────────────────────────
    let insights: { text: string; type: string }[] = [];
    try {
      // Extraire le JSON même si Groq ajoute du texte avant/après
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      }
    } catch {
      insights = [
        { text: "Analyse IA en cours... Données insuffisantes pour générer des recommandations précises.", type: "info" }
      ];
    }

    // ── 5. Retourner insights + métriques réelles ─────────────────────────
    return NextResponse.json({
      insights,
      metrics: {
        caravans_total:    dataSummary.caravans_total,
        caravans_active:   dataSummary.caravans_active,
        teams_total:       dataSummary.teams_total,
        activities_total:  dataSummary.activities_total,
        reports_total:     dataSummary.reports_total,
      },
      generated_at: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error("[AI Insights API] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur lors de la génération des insights IA", details: message },
      { status: 500 }
    );
  }
}
