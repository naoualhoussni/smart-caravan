const payload = {
  name: "Bilan de test",
  date: "06/07/2026",
  type: "Texte IA",
  size: "N/A",
  status: "Prêt",
  school: "Inconnue",
  trainer: "Test",
  province: "Maroc",
  summary: "Test summary",
  participants: 0,
  duration: "Non défini"
};

fetch('https://fbagqkvugctgnonuptmt.supabase.co/rest/v1/reports', {
  method: 'POST',
  headers: {
    'apikey': 'sb_publishable_NDenFMKrY5BYc8FhWVZY3w_Pp6Z_FTg',
    'Authorization': 'Bearer sb_publishable_NDenFMKrY5BYc8FhWVZY3w_Pp6Z_FTg',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(payload)
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(console.log)
.catch(console.error);
