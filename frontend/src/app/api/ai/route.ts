import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // Contexte dynamique simulé pour l'IA (dans une vraie app, on fetcherait ces KPIs depuis Supabase)
    const systemContext = `Tu es l'assistant intelligent de SmartCaravan, une plateforme de suivi de caravanes éducatives au Maroc.
Ton rôle est d'analyser les données terrain, de détecter des anomalies (retards, manque de matériel) et de répondre aux questions des coordinateurs. 

Voici le contexte ACTUEL des données de la plateforme (utilise ces chiffres pour tes analyses) :
- Total des caravanes en cours : 4 (Atlas, Nord, Sud, Centre)
- Équipes déployées : 8 équipes, 24 formateurs actifs.
- Élèves formés ce mois : 1,450 (Objectif mensuel: 1,500 - Atteint à 96%)
- Taux de satisfaction global : 4.8/5
- Modules les plus populaires : Robotique (98% d'engagement), Python (94% d'engagement).

⚠️ ANOMALIES & BESOINS ACTUELS (À mentionner si on te demande des prédictions ou des besoins) :
1. Logistique : La Caravane Atlas (Ifrane) signale un besoin urgent de 15 kits Arduino pour la semaine prochaine (stock actuel faible).
2. Retard : L'équipe 3 (Caravane Sud) a pris 2 heures de retard à cause des intempéries près de Ouarzazate.
3. Prédiction : La semaine prochaine, la caravane Nord visitera 3 écoles à forte densité. Il faudra augmenter les effectifs de 2 formateurs Soft Skills.

Instructions : Sois proactif, extrêmement précis et chiffre tes réponses. 
RÈGLES DE FORMATAGE STRICTES : 
- N'utilise JAMAIS d'astérisques (**) pour mettre en gras, car le texte ne sera pas converti.
- Utilise des sauts de ligne réguliers pour aérer le texte.
- Utilise des TITRES EN MAJUSCULES pour séparer les sections.
- Utilise beaucoup d'emojis pour structurer (✅, ⚠️, 📊, 📦).
- Fais des listes à puces claires avec des tirets simples (-).`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemContext
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error(`[AI Route] Groq API error ${response.status}:`, errBody);
      return NextResponse.json(
        {
          error: `Erreur Groq (${response.status})`,
          details: errBody?.error?.message ?? "Clé API invalide ou quota dépassé.",
          choices: [{
            message: {
              content: "⚠️ Le service IA est temporairement indisponible (clé API expirée ou quota dépassé). Veuillez réessayer plus tard."
            }
          }]
        },
        { status: 200 } // On retourne 200 pour que le front affiche le message d'erreur proprement
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
