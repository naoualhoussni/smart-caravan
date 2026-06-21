import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import r2_score, mean_absolute_error, accuracy_score, make_scorer
from sklearn.dummy import DummyRegressor, DummyClassifier
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

def train():
    print("="*60)
    print(" SMART CARAVAN - ENTRAINEMENT HONNÊTE (Avec régularisation & CV)")
    print("="*60)
    
    # 1. Chargement du dataset
    print("\n1. Chargement du dataset...")
    df = pd.read_csv('caravanes_dataset.csv')
    print(f"   -> {len(df)} lignes, {len(df.columns)} colonnes.")

    # 2. Gestion des valeurs manquantes
    print("\n2. Nettoyage des valeurs manquantes...")
    cat_cols = ['province', 'type_zone', 'type_etablissement', 'nom_etablissement', 'theme', 'saison', 'jour']
    for col in cat_cols:
        if col in df.columns:
            df[col] = df[col].fillna('Inconnu')
    num_cols = ['nb_eleves', 'mois_depuis_derniere_visite', 'distance_km', 'budget_mad']
    for col in num_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    print("   -> NA traitées.")

    # 3. Encodage sur TOUTES les données (car on va faire de la CV)
    #    On n'utilise pas de split fixe ici, on laisse la CV gérer la généralisation.
    print("\n3. Encodage des variables catégorielles (sur toutes les données)...")
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    print("   -> Encodage terminé.")

    # 4. Définition des features (on exclut toujours 'nom_etablissement_enc')
    FEATURES = [
        'province_enc', 'type_zone_enc', 'type_etab_enc',
        'nb_eleves', 'mois_depuis_derniere_visite',
        'theme_enc', 'saison_enc', 'jour_enc',
        'distance_km', 'budget_mad'
    ]
    X = df[FEATURES]
    y_eng = df['score_engagement']
    y_risk = df['risque_logistique']
    print(y_risk)
    exit()
    print(f"\n4. Features utilisées : {FEATURES}")

    # --- 5. Évaluation HONNÊTE via Cross-Validation (5-fold) ---
    print("\n5. Évaluation par validation croisée (5 folds) :")
    
    # Pour la régression
    rf_eng = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,           # ← Régularisation forte
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    cv_scores_r2 = cross_val_score(rf_eng, X, y_eng, cv=5, scoring='r2')
    cv_scores_mae = cross_val_score(rf_eng, X, y_eng, cv=5, 
                                    scoring=make_scorer(mean_absolute_error))
    
    print(f"   R² moyen (CV)   : {cv_scores_r2.mean():.3f} (±{cv_scores_r2.std():.3f})")
    print(f"   MAE moyen (CV)  : {cv_scores_mae.mean():.2f} (±{cv_scores_mae.std():.2f}) points")

    # --- Baseline Dummy (prédire la moyenne) ---
    dummy_reg = DummyRegressor(strategy='mean')
    dummy_r2 = cross_val_score(dummy_reg, X, y_eng, cv=5, scoring='r2').mean()
    print(f"   R² du modèle Dummy (moyenne) : {dummy_r2:.3f} (le gain réel est donc de {cv_scores_r2.mean() - dummy_r2:.3f})")

    # Pour la classification (risque)
    rf_risk = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    cv_acc = cross_val_score(rf_risk, X, y_risk, cv=5, scoring='accuracy')
    print(f"\n   Accuracy Risque (CV) : {cv_acc.mean():.3f} (±{cv_acc.std():.3f})")

    dummy_clf = DummyClassifier(strategy='most_frequent')
    dummy_acc = cross_val_score(dummy_clf, X, y_risk, cv=5, scoring='accuracy').mean()
    print(f"   Accuracy Dummy (classe majoritaire) : {dummy_acc:.3f}")

    # --- 6. Entraînement final sur TOUTES les données (pour la prod) ---
    print("\n6. Ré-entraînement final sur 100% des données (avec régularisation)...")
    final_rf_eng = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    final_rf_eng.fit(X, y_eng)
    
    final_rf_risk = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    final_rf_risk.fit(X, y_risk)

    # 7. Importance des features (pour l'explicabilité)
    print("\n7. Top 5 features influentes (engagement) :")
    importances = pd.Series(final_rf_eng.feature_importances_, index=FEATURES).sort_values(ascending=False)
    for feat, imp in importances.head(5).items():
        print(f"   {feat}: {imp:.3f}")

    # 8. Sauvegarde (même structure que l'ancien script)
    print("\n8. Sauvegarde des modèles...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(final_rf_eng, 'models/rf_engagement.pkl')
    joblib.dump(final_rf_risk, 'models/rf_risque.pkl')
    joblib.dump(encoders, 'models/encoders.pkl')
    joblib.dump(FEATURES, 'models/features.pkl')
    print("   -> Modèles sauvegardés dans 'models/'")

    print("\n" + "="*60)
    print(" ENTRAÎNEMENT TERMINÉ - Résultats réalistes et interprétables")
    print("="*60)

if __name__ == "__main__":
    train()