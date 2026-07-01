import csv
import random

# Dictionnaire des vrais établissements par province avec leurs données réelles simulées
ETABLISSEMENTS = {
    # --- ZONE RURALE ---
    "Tinghir": [
        {"nom": "Lycée Bamou", "nb_eleves": 520, "type": "Lycée"},
        {"nom": "Lycée Salah Eddine Al Ayoubi", "nb_eleves": 380, "type": "Lycée"},
        {"nom": "Collège Ibn Sina", "nb_eleves": 650, "type": "Collège"},
    ],
    "Azilal": [
        {"nom": "Lycée Ouzoud", "nb_eleves": 440, "type": "Lycée"},
        {"nom": "Lycée Technique Azilal", "nb_eleves": 310, "type": "Lycée Technique"},
        {"nom": "Collège Demnate", "nb_eleves": 580, "type": "Collège"},
    ],
    "Midelt": [
        {"nom": "Lycée Moulay Ali Cherif", "nb_eleves": 490, "type": "Lycée"},
        {"nom": "Collège Ibn Khaldoun", "nb_eleves": 620, "type": "Collège"},
    ],
    "Zagora": [
        {"nom": "Lycée Hassan II", "nb_eleves": 410, "type": "Lycée"},
        {"nom": "Collège Al Massira", "nb_eleves": 530, "type": "Collège"},
    ],
    "Chefchaouen": [
        {"nom": "Lycée Ibn Khaldoun", "nb_eleves": 470, "type": "Lycée"},
        {"nom": "Collège Al Houria", "nb_eleves": 590, "type": "Collège"},
    ],
    "Al Hoceima": [
        {"nom": "Lycée Mohammed V", "nb_eleves": 560, "type": "Lycée"},
        {"nom": "Lycée Bayed Moulay", "nb_eleves": 420, "type": "Lycée"},
    ],
    "Tata": [
        {"nom": "Lycée Hassan Ier", "nb_eleves": 310, "type": "Lycée"},
        {"nom": "Collège Ibn Batouta", "nb_eleves": 480, "type": "Collège"},
    ],
    # --- ZONE MIXTE ---
    "Beni Mellal": [
        {"nom": "Lycée Ibn Sina", "nb_eleves": 720, "type": "Lycée"},
        {"nom": "Lycée Hassan II Beni Mellal", "nb_eleves": 650, "type": "Lycée"},
        {"nom": "CPGE Beni Mellal", "nb_eleves": 200, "type": "CPGE"},
    ],
    "Kenitra": [
        {"nom": "Lycée Ibn Tahir", "nb_eleves": 810, "type": "Lycée"},
        {"nom": "Lycée Abdelmalek Essaadi", "nb_eleves": 740, "type": "Lycée"},
        {"nom": "Lycée Technique Kenitra", "nb_eleves": 560, "type": "Lycée Technique"},
    ],
    "Taroudant": [
        {"nom": "Lycée Mohammed V Taroudant", "nb_eleves": 680, "type": "Lycée"},
        {"nom": "Lycée Ibn Soulaiman Roudani", "nb_eleves": 550, "type": "Lycée"},
        {"nom": "Collège Al Majd", "nb_eleves": 790, "type": "Collège"},
    ],
    "Safi": [
        {"nom": "Lycée Zerktouni", "nb_eleves": 700, "type": "Lycée"},
        {"nom": "Lycée Moulay Ismail", "nb_eleves": 630, "type": "Lycée"},
    ],
    "Settat": [
        {"nom": "Lycée Allal Al Fassi", "nb_eleves": 850, "type": "Lycée"},
        {"nom": "Collège Al Wahda", "nb_eleves": 910, "type": "Collège"},
    ],
    # --- ZONE URBAINE ---
    "Casablanca": [
        {"nom": "Lycée Moulay Abdellah", "nb_eleves": 1200, "type": "Lycée"},
        {"nom": "Lycée Al Khawarizmi", "nb_eleves": 980, "type": "Lycée"},
        {"nom": "Lycée Mohammed V Casa", "nb_eleves": 1100, "type": "Lycée"},
        {"nom": "Lycée technique Ain Sebaa", "nb_eleves": 890, "type": "Lycée Technique"},
    ],
    "Rabat": [
        {"nom": "Lycée Moulay Youssef", "nb_eleves": 1050, "type": "Lycée"},
        {"nom": "Lycée Lalla Aicha", "nb_eleves": 920, "type": "Lycée"},
        {"nom": "CPGE Descartes Rabat", "nb_eleves": 250, "type": "CPGE"},
    ],
    "Marrakech": [
        {"nom": "Lycée Ibn Abbad", "nb_eleves": 960, "type": "Lycée"},
        {"nom": "Lycée Hassan II Marrakech", "nb_eleves": 880, "type": "Lycée"},
        {"nom": "Lycée Victor Hugo", "nb_eleves": 750, "type": "Lycée"},
    ],
    "Fes": [
        {"nom": "Lycée Moulay Idriss", "nb_eleves": 1030, "type": "Lycée"},
        {"nom": "Lycée Ibn Al Khatib", "nb_eleves": 870, "type": "Lycée"},
        {"nom": "CPGE Al Khansaa", "nb_eleves": 220, "type": "CPGE"},
    ],
    "Agadir-Ida-Ou-Tanane": [
        {"nom": "Lycée Al Imam Malik", "nb_eleves": 990, "type": "Lycée"},
        {"nom": "Lycée Moulay Abdellah Agadir", "nb_eleves": 860, "type": "Lycée"},
    ],
    "Tanger-Assilah": [
        {"nom": "Lycée Ibn Al Khatib Tanger", "nb_eleves": 1010, "type": "Lycée"},
        {"nom": "Lycée Technique Tanger", "nb_eleves": 780, "type": "Lycée Technique"},
        {"nom": "Lycée Moulay Abdelaziz", "nb_eleves": 930, "type": "Lycée"},
    ],
}

TYPE_ZONE_MAP = {
    "Tinghir": "Rurale", "Azilal": "Rurale", "Midelt": "Rurale", "Zagora": "Rurale",
    "Chefchaouen": "Rurale", "Al Hoceima": "Rurale", "Tata": "Rurale",
    "Beni Mellal": "Mixte", "Kenitra": "Mixte", "Taroudant": "Mixte",
    "Safi": "Mixte", "Settat": "Mixte",
    "Casablanca": "Urbaine", "Rabat": "Urbaine", "Marrakech": "Urbaine",
    "Fes": "Urbaine", "Agadir-Ida-Ou-Tanane": "Urbaine", "Tanger-Assilah": "Urbaine"
}

DISTANCE_MAP = {
    "Rurale": (150, 450),
    "Mixte": (50, 150),
    "Urbaine": (10, 50)
}

def generate_dataset(filename="caravanes_dataset.csv", num_rows=5000):
    themes = ['Robotique & Arduino', 'Initiation Python', 'Creation de Jeux Scratch', 'Intelligence Artificielle MVP']
    saisons = ['Printemps', 'Ete', 'Automne', 'Hiver']
    jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

    print(f"Generation de {num_rows} lignes de donnees simulees (niveau etablissement)...")

    all_provinces = list(ETABLISSEMENTS.keys())

    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([
            'province', 'type_zone', 'nom_etablissement', 'type_etablissement', 'nb_eleves',
            'mois_depuis_derniere_visite', 'theme', 'saison', 'jour',
            'distance_km', 'budget_mad', 'risque_logistique', 'score_engagement'
        ])

        for _ in range(num_rows):
            province = random.choice(all_provinces)
            type_zone = TYPE_ZONE_MAP[province]
            etablissement = random.choice(ETABLISSEMENTS[province])
            nom_etab = etablissement["nom"]
            type_etab = etablissement["type"]
            nb_eleves = etablissement["nb_eleves"] + random.randint(-50, 50)

            # Mois depuis la dernière visite (0 = jamais visité avant, plus c'est élevé plus c'est prioritaire)
            mois_visite = random.randint(0, 24)

            theme = random.choice(themes)
            saison = random.choice(saisons)
            jour = random.choice(jours)

            dist_min, dist_max = DISTANCE_MAP[type_zone]
            distance_km = random.randint(dist_min, dist_max)

            base_engagement = 60
            risque_score = 0

            # Règle 1 : Type de zone
            if type_zone == "Rurale":
                base_engagement += 8   # (Avant: 18)
                risque_score += 40
            elif type_zone == "Mixte":
                base_engagement += 4   # (Avant: 8)
                risque_score += 20
            else:
                base_engagement -= 5
                risque_score += 5

            # Règle 2 : Plus l'école n'a pas été visitée depuis longtemps, plus l'engagement est fort
            if mois_visite >= 12:
                base_engagement += 8   # (Avant: 15)
            elif mois_visite >= 6:
                base_engagement += 4   # (Avant: 8)
            elif mois_visite <= 2:
                base_engagement -= 10

            # Règle 3 : Plus l'école est grande, plus le potentiel d'impact est élevé
            if nb_eleves >= 800:
                base_engagement += 5   # (Avant: 8)
            elif nb_eleves >= 500:
                base_engagement += 2   # (Avant: 4)

            # Règle 4 : Type d'établissement
            if type_etab == "CPGE":
                base_engagement += 8   # (Avant: 12)
            elif type_etab == "Lycée Technique":
                base_engagement += 4   # (Avant: 6)

            # Règle 5 : Thème selon contexte
            if theme == 'Robotique & Arduino' and type_zone in ["Rurale", "Mixte"]:
                base_engagement += 5   # (Avant: 10)
            elif theme == 'Creation de Jeux Scratch' and type_zone == "Urbaine":
                base_engagement -= 8

            # Règle 6 : Saison
            if saison == 'Hiver' and type_zone == "Rurale":
                risque_score += 40
            elif saison == 'Ete':
                base_engagement -= 15

            # Règle 7 : Jour
            if jour in ['Samedi', 'Dimanche']:
                base_engagement += 5   # (Avant: 10)
            elif jour == 'Lundi':
                base_engagement -= 5

            engagement = int(base_engagement + random.uniform(-8, 8))
            engagement = max(0, min(100, engagement))

            risque_final = min(100, risque_score + random.randint(-10, 20))
            if risque_final > 70:
                risque_label = "Eleve"
            elif risque_final > 40:
                risque_label = "Moyen"
            else:
                risque_label = "Faible"

            budget = distance_km * random.uniform(8, 12)
            if risque_label == "Eleve":
                budget *= 1.5
            budget_mad = round(budget, 2)

            writer.writerow([
                province, type_zone, nom_etab, type_etab, nb_eleves,
                mois_visite, theme, saison, jour,
                distance_km, budget_mad, risque_label, engagement
            ])

    print(f"Le fichier '{filename}' a ete genere avec succes (niveau etablissement).")

if __name__ == "__main__":
    generate_dataset()
