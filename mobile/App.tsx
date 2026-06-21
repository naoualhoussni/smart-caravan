import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from './lib/supabase';

import { MapView, Marker } from './Map';

export default function App() {
  // Auth states
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState('Home'); // Home, Map, Chat, Profile

  // States pour le GPS
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationText, setLocationText] = useState('Check-in GPS');

  // States pour les autres fonctionnalités
  const [showBilanModal, setShowBilanModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant SmartCaravan. Avez-vous besoin d'aide pour l'atelier d'aujourd'hui ?", sender: 'ai' }
  ]);
  const [messageInput, setMessageInput] = useState("");

  // Nouvelles fonctionnalités dynamiques
  const [activities, setActivities] = useState<any[]>([]);
  const [profile, setProfile] = useState({ fullName: '', phone: '', points: 1240, level: 'Expert Code' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Scanner et Bilan
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBadge, setScannedBadge] = useState<string | null>(null);

  const [bilanText, setBilanText] = useState("");
  const [generatingBilan, setGeneratingBilan] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [hasParentalConsent, setHasParentalConsent] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthChecking(false);
      if (session) {
        await loadUserAndActivities(session.user.id);
      }
    }
    loadData();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await loadUserAndActivities(session.user.id);
      } else {
        setActivities([]);
      }
    });
  }, []);

  const loadUserAndActivities = async (userId: string) => {
    const trainerName = await fetchProfile(userId);
    if (trainerName) {
      await fetchActivities(trainerName);
    } else {
      setActivities([]);
    }
  };

  const fetchActivities = async (trainerName: string) => {
    try {
      // Filtrage STRICT : On ne récupère que les activités assignées à CE formateur précis
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trainer_name', trainerName)
        .order('date', { ascending: false });
        
      if (data && !error) setActivities(data);
    } catch (e) {}
  };

  const fetchProfile = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data && !error) {
        setProfile({ fullName: data.full_name || '', phone: data.phone || '', points: data.points || 1240, level: data.level || 'Expert Code' });
        return data.full_name;
      }
    } catch (e) {}
    return null;
  };

  const saveProfile = async () => {
    if (!session?.user?.id) return;
    try {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: profile.fullName,
        phone: profile.phone,
        points: profile.points,
        level: profile.level
      });
      setIsEditingProfile(false);
      if (Platform.OS !== 'web') Alert.alert('Succès', 'Profil mis à jour !');
    } catch (e) {
      if (Platform.OS !== 'web') Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
    }
  };

  async function signInWithEmail() {
    setLoadingAuth(true);
    
    // Bypass de test pour contourner la confirmation d'email Supabase
    if (email.trim().toLowerCase() === 'test@smartcaravan.com' && password === 'password123') {
       setSession({ user: { id: 'f7908f0b-6727-4973-9f14-34bc0a888ce3', email: 'test@smartcaravan.com' } });
       setLoadingAuth(false);
       return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (Platform.OS !== 'web') Alert.alert('Erreur', error.message);
      else alert('Erreur: ' + error.message);
    }
    setLoadingAuth(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const saveBilan = async () => {
    if (!bilanText.trim()) {
      if (Platform.OS !== 'web') Alert.alert("Erreur", "Veuillez écrire un bilan avant de l'envoyer.");
      else alert("Veuillez écrire un bilan.");
      return;
    }

    if (hasParentalConsent && signaturePoints.length === 0) {
      if (Platform.OS !== 'web') Alert.alert("Erreur", "Veuillez apposer votre signature électronique.");
      else alert("Veuillez apposer votre signature électronique.");
      return;
    }
    
    let finalBilanText = bilanText;
    if (hasParentalConsent) {
      finalBilanText += `\n\n[RGPD/CNDP] Consentement parental signé électroniquement sur place (Tracé : ${signaturePoints.length} points).`;
    } else {
      finalBilanText += `\n\n[RGPD/CNDP] Sans consentement parental pour diffusion média.`;
    }

    const { error } = await supabase.from('reports').insert([{
      name: `Bilan : ${selectedActivity?.theme}`,
      date: new Date().toLocaleDateString('fr-FR'),
      type: 'Texte IA',
      size: 'N/A',
      status: 'Prêt',
      school: selectedActivity?.school_name || 'Inconnue',
      trainer: profile.fullName || 'Formateur Mobile',
      province: 'Maroc',
      summary: finalBilanText,
      participants: 0,
      duration: selectedActivity?.time_slot || 'Non défini'
    }]);

    if (error) {
      if (Platform.OS !== 'web') Alert.alert("Erreur", "Vérifiez que la table 'reports' existe et RLS désactivé.");
      else alert("Erreur: Vérifiez la table 'reports' et RLS.");
      console.log(error);
    } else {
      if (Platform.OS !== 'web') Alert.alert("Succès", "Le bilan a été transmis à l'administration avec signature de consentement !");
      else alert("Bilan transmis avec signature !");
      setShowBilanModal(false);
      setBilanText("");
      setHasParentalConsent(false);
      setSignaturePoints([]);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    const userText = messageInput.trim();
    const newMsg = { id: Date.now(), text: userText, sender: 'user' };
    
    // Garder l'historique pour le contexte
    const history = chatMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    setChatMessages(prev => [...prev, newMsg]);
    setMessageInput("");
    
    try {
      const response = await fetch('http://10.226.140.35:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: userText }] })
      });
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        setChatMessages(prev => [...prev, { id: Date.now()+1, text: data.choices[0].message.content, sender: 'ai' }]);
      } else {
        setChatMessages(prev => [...prev, { id: Date.now()+1, text: "Désolé, la connexion à l'IA a échoué.", sender: 'ai' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { id: Date.now()+1, text: "Serveur IA inaccessible. Vérifiez la connexion.", sender: 'ai' }]);
    }
  };

  // Fonction Helper pour calculer la distance (Formule de Haversine simplifiée)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  const handleCheckIn = async (activity: any) => {
    try {
      setLocationText('Vérification GPS...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('GPS refusé');
        if (Platform.OS !== 'web') Alert.alert('Erreur', 'Permission GPS refusée.');
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      
      // Coordonnées simulées pour l'école cible (En réalité, ça viendrait de Supabase)
      // On simule que l'école est à Ifrane : 33.5333, -5.1167
      const schoolLat = 33.5333;
      const schoolLng = -5.1167;
      
      const distance = calculateDistance(currentLoc.coords.latitude, currentLoc.coords.longitude, schoolLat, schoolLng);
      
      // Tolérance de 500 mètres (0.5 km)
      if (distance > 0.5) {
        setLocationText('Check-in Refusé');
        if (Platform.OS !== 'web') {
          Alert.alert('Erreur de Localisation', `Vous êtes à ${(distance).toFixed(1)} km de l'établissement (${activity?.school_name || 'Lycée'}). Vous devez être sur place pour valider votre présence.`);
        } else {
          alert(`Erreur : Vous êtes trop loin de l'école (${(distance).toFixed(1)} km)`);
        }
        return;
      }

      setLocation(currentLoc);
      setIsCheckedIn(true);
      setLocationText('Présence Validée ✅');
      if (Platform.OS !== 'web') Alert.alert('Succès', 'Votre présence a été vérifiée et enregistrée avec succès sur le Dashboard.');
      
      // Mise à jour du statut dans Supabase
      if (activity?.id) {
         await supabase.from('activities').update({ status: 'completed' }).eq('id', activity.id);
         fetchActivities();
      }

    } catch (err) {
      setLocationText('Erreur GPS');
    }
  };

  const openScanner = async () => {
    // La caméra est maintenant autorisée sur la version Web
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        if (Platform.OS !== 'web') Alert.alert('Erreur', 'Permission caméra refusée.');
        else alert('Permission caméra refusée.');
        return;
      }
    }
    setScannedBadge(null); // Réinitialiser le badge précédent
    setShowScanner(true);
  };

  if (authChecking) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00B4A0" />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            {/* Ligne commentée pour l'instant car le fichier logo.png est manquant sur votre disque dur : */}
            {/* <Image source={require('./assets/logo.png')} style={{width: 250, height: 100, resizeMode: 'contain', marginBottom: 16}} /> */}
            <View style={styles.logoBox}>
               <Ionicons name="car-sport" size={36} color="#ffffff" />
            </View>
            <Text style={styles.title}>SmartCaravan</Text>
            <Text style={styles.subtitle}>Espace Formateur</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Email professionnel</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.inputWithIcon} 
                placeholder="youssef@smartcaravan.ma" 
                placeholderTextColor="#64748b" 
                onChangeText={(text) => setEmail(text)}
                value={email}
                autoCapitalize={'none'}
              />
            </View>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.inputWithIcon} 
                placeholder="••••••••" 
                secureTextEntry 
                placeholderTextColor="#64748b" 
                onChangeText={(text) => setPassword(text)}
                value={password}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loadingAuth}>
              {loadingAuth ? <ActivityIndicator color="#ffffff" /> : (
                <>
                  <Text style={styles.buttonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{marginLeft: 8}} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderHome = () => {
    // Fallback : Si la table Supabase renvoie un tableau vide (souvent à cause des règles RLS),
    // on injecte une activité de démonstration pour que vous puissiez toujours tester le Check-in GPS !
    const todayActivity = activities.length > 0 ? activities[0] : {
      id: 'demo-1',
      school_name: 'Lycée Al Farabi (Démo)',
      theme: 'Robotique (Synchronisation en attente)',
      status: 'pending',
      trainer_name: profile.fullName || 'Vous'
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Gamification Réelle */}
        <View style={styles.gamificationCard}>
           <View style={styles.gamiTop}>
              <View style={styles.gamiIconBox}>
                 <Ionicons name="trophy" size={24} color="#FBBF24" />
              </View>
              <View style={styles.gamiInfo}>
                 <Text style={styles.gamiTitle}>Niveau : {profile.level}</Text>
                 <Text style={styles.gamiPoints}>{profile.points} pts cumulés</Text>
              </View>
           </View>
           <View style={styles.progressBarWrapper}>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${Math.min(100, (profile.points % 1000) / 10)}%` }]} /></View>
           </View>
           <Text style={styles.gamiSub}>Encore {1000 - (profile.points % 1000)} pts pour débloquer le prochain palier !</Text>
        </View>

        <Text style={styles.sectionTitle}>Actions Terrain</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, isCheckedIn ? styles.actionCardActive : null]}
            onPress={() => handleCheckIn(todayActivity)}
            disabled={isCheckedIn || !todayActivity}
          >
            <View style={[styles.actionIconContainer, isCheckedIn && {backgroundColor: 'rgba(0,180,160,0.15)'}]}>
              <Ionicons name={isCheckedIn ? "checkmark-circle" : "location"} size={28} color={isCheckedIn ? "#00B4A0" : "#38BDF8"} />
            </View>
            <Text style={[styles.actionTitle, isCheckedIn && {color: '#00B4A0'}]}>{locationText}</Text>
            <Text style={styles.actionSub}>{todayActivity ? todayActivity.school_name : 'Aucun atelier'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={openScanner}>
            <View style={[styles.actionIconContainer, {backgroundColor: 'rgba(56,189,248,0.15)'}]}>
               <Ionicons name="qr-code" size={28} color="#38BDF8" />
            </View>
            <Text style={styles.actionTitle}>Scanner</Text>
            <Text style={styles.actionSub}>Badge Élève</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, {marginTop: 24}]}>Programme du jour</Text>
        
        {activities.length === 0 && (
          <View style={{backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 16, marginBottom: 16}}>
             <Text style={{color: '#FBBF24', fontSize: 13}}>Note : Si votre atelier créé sur le Web n'apparaît pas ici, c'est que votre table "activities" sur Supabase a des règles de sécurité (RLS) qui bloquent la lecture. Une activité de démo a été ajoutée ci-dessous pour vous permettre de tester.</Text>
          </View>
        )}

        {(activities.length > 0 ? activities : [todayActivity]).map((act) => (
            <View key={act.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Ionicons name="time-outline" size={16} color="#00B4A0" style={{marginRight: 4}} />
                   <Text style={styles.taskTime}>{act.date} | {act.time_slot}</Text>
                </View>
                <View style={[styles.badgePending, act.status === 'completed' && {backgroundColor: 'rgba(0,180,160,0.1)'}]}>
                  <Text style={[styles.badgeTextPending, act.status === 'completed' && {color: '#00B4A0'}]}>
                    {act.status === 'completed' ? 'Terminé' : 'En cours'}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskTitle}>{act.theme}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                 <Ionicons name="business" size={14} color="#94a3b8" style={{marginRight: 6}} />
                 <Text style={styles.taskLocation}>{act.school_name} - Assigné: {act.trainer_name}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.taskButton, act.status === 'completed' && {backgroundColor: '#334155'}]} 
                onPress={() => {
                   setSelectedActivity(act);
                   setHasParentalConsent(false);
                   setSignaturePoints([]);
                   setShowBilanModal(true);
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#ffffff" style={{marginRight: 8}} />
                <Text style={[styles.taskButtonText, act.status === 'completed' && {color: '#ffffff'}]}>
                   {act.status === 'completed' ? 'Voir le Bilan' : "Saisir le Bilan d'Intervention"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        }
      </ScrollView>
    );
  };

  const renderMap = () => (
    <View style={styles.mapContainer}>
      {!MapView ? (
        <View style={styles.mapBackground}>
          <Ionicons name="map-outline" size={48} color="#94a3b8" style={{marginBottom: 16}} />
          <Text style={{color: '#F1F5F9', fontSize: 18, fontWeight: 'bold', marginBottom: 12}}>Carte Interactive Native</Text>
          <Text style={{color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22}}>Erreur de chargement de la carte.</Text>
        </View>
      ) : (
        <MapView 
          style={{flex: 1}}
          userInterfaceStyle="dark"
          initialRegion={{
            latitude: 33.5333,
            longitude: -5.1167,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location && (
            <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Votre position actuelle" pinColor="#00B4A0" />
          )}
          <Marker coordinate={{ latitude: 33.5333, longitude: -5.1167 }} title="Lycée Al Farabi" description="Atelier Robotique (En cours)" pinColor="#00B4A0" />
          <Marker coordinate={{ latitude: 33.5100, longitude: -5.1300 }} title="Collège Ibn Sina" description="Terminé" pinColor="#94a3b8" />
        </MapView>
      )}
      
      <View style={styles.mapLegend}>
         <View style={styles.mapLegendCard}>
            <Text style={styles.sectionTitle}>Votre Tournée</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Ionicons name={location ? "navigate" : "locate"} size={18} color={location ? "#00B4A0" : "#94a3b8"} style={{marginRight: 8}} />
               <Text style={{color: '#F1F5F9', fontWeight: '500'}}>{location ? `Position GPS: ${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}` : 'En attente de pointage GPS...'}</Text>
            </View>
         </View>
      </View>
    </View>
  );

  const renderChat = () => (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.chatScroll}>
        <View style={styles.chatInfoBadge}>
           <Ionicons name="shield-checkmark" size={14} color="#00B4A0" style={{marginRight: 6}} />
           <Text style={styles.chatInfoText}>IA connectée au contexte SmartCaravan</Text>
        </View>
        {chatMessages.map(msg => (
          <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi]}>
             {msg.sender === 'ai' && <View style={styles.aiAvatar}><Ionicons name="color-wand" size={14} color="#fff" /></View>}
             <View style={[styles.messageBubble, msg.sender === 'user' ? styles.messageUser : styles.messageAi]}>
               <Text style={[styles.messageText, msg.sender === 'user' ? {color: '#ffffff'} : {color: '#F1F5F9'}]}>{msg.text}</Text>
             </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.chatInputContainer}>
        <TextInput 
          style={styles.chatInput} 
          placeholder="Demandez de l'aide à l'IA..." 
          value={messageInput}
          onChangeText={setMessageInput}
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity style={[styles.chatSendBtn, !messageInput.trim() && {backgroundColor: '#334155'}]} onPress={sendMessage}>
          <Ionicons name="paper-plane" size={20} color={messageInput.trim() ? "#ffffff" : "#64748b"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderProfile = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={{alignItems: 'center', marginBottom: 32}}>
        <View style={[styles.avatar, {width: 80, height: 80, borderRadius: 24, marginBottom: 16}]}>
          <Text style={[styles.avatarText, {fontSize: 28}]}>{profile.fullName ? profile.fullName.substring(0,2).toUpperCase() : session?.user?.email?.substring(0,2).toUpperCase()}</Text>
        </View>
        <Text style={{fontSize: 22, fontWeight: '900', color: '#F1F5F9'}}>{profile.fullName || session?.user?.email}</Text>
        <Text style={{fontSize: 14, color: '#94a3b8', marginTop: 4}}>{profile.level} - {profile.points} pts</Text>
      </View>

      <View style={{backgroundColor: '#1E293B', padding: 24, borderRadius: 24, marginBottom: 24}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
          <Text style={styles.sectionTitle}>Mes Informations</Text>
          <TouchableOpacity onPress={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}>
             <Text style={{color: '#00B4A0', fontWeight: 'bold'}}>{isEditingProfile ? 'Sauvegarder' : 'Modifier'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput 
          style={[styles.inputWrapper, {height: 48, paddingHorizontal: 16, color: '#fff', marginBottom: 16}]} 
          value={profile.fullName} 
          onChangeText={(txt) => setProfile({...profile, fullName: txt})} 
          editable={isEditingProfile} 
          placeholder="Ex: Youssef Alami"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput 
          style={[styles.inputWrapper, {height: 48, paddingHorizontal: 16, color: '#fff', marginBottom: 16}]} 
          value={profile.phone} 
          onChangeText={(txt) => setProfile({...profile, phone: txt})} 
          editable={isEditingProfile} 
          placeholder="Ex: +212 6 00 00 00 00"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={[styles.button, {backgroundColor: '#ef4444', shadowColor: '#ef4444', marginTop: 10}]} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{marginRight: 8}} />
        <Text style={styles.buttonText}>Me déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
           <View>
             <Text style={styles.headerDate}><Ionicons name="calendar-clear-outline" size={12} /> 15 Juin 2026</Text>
             <Text style={styles.headerGreeting}>
                {activeTab === 'Home' ? 'Tableau de Bord' : activeTab === 'Map' ? 'Tournée GPS' : activeTab === 'Chat' ? 'Coach IA' : 'Profil'}
             </Text>
           </View>
           <TouchableOpacity style={styles.avatar} onPress={() => setActiveTab('Profile')}>
             <Text style={styles.avatarText}>{session?.user?.email?.substring(0,2).toUpperCase() || 'YA'}</Text>
             <View style={styles.avatarBadge} />
           </TouchableOpacity>
        </View>
      </View>

      {/* Contenu principal */}
      <View style={{flex: 1, backgroundColor: '#0F172A'}}>
        {activeTab === 'Home' && renderHome()}
        {activeTab === 'Map' && renderMap()}
        {activeTab === 'Chat' && renderChat()}
        {activeTab === 'Profile' && renderProfile()}
      </View>

      {/* Modern Bottom Tab Navigation */}
      <View style={styles.bottomNavContainer}>
         <View style={styles.bottomNav}>
           <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Home')}>
             <Ionicons name={activeTab === 'Home' ? "home" : "home-outline"} size={24} color={activeTab === 'Home' ? "#00B4A0" : "#64748b"} />
             <Text style={[styles.tabText, activeTab === 'Home' && styles.tabTextActive]}>Accueil</Text>
             {activeTab === 'Home' && <View style={styles.activeDot} />}
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Map')}>
             <Ionicons name={activeTab === 'Map' ? "map" : "map-outline"} size={24} color={activeTab === 'Map' ? "#00B4A0" : "#64748b"} />
             <Text style={[styles.tabText, activeTab === 'Map' && styles.tabTextActive]}>Carte</Text>
             {activeTab === 'Map' && <View style={styles.activeDot} />}
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Chat')}>
             <Ionicons name={activeTab === 'Chat' ? "sparkles" : "sparkles-outline"} size={24} color={activeTab === 'Chat' ? "#00B4A0" : "#64748b"} />
             <Text style={[styles.tabText, activeTab === 'Chat' && styles.tabTextActive]}>IA Coach</Text>
             {activeTab === 'Chat' && <View style={styles.activeDot} />}
           </TouchableOpacity>

           <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Profile')}>
             <Ionicons name={activeTab === 'Profile' ? "person" : "person-outline"} size={24} color={activeTab === 'Profile' ? "#00B4A0" : "#64748b"} />
             <Text style={[styles.tabText, activeTab === 'Profile' && styles.tabTextActive]}>Profil</Text>
             {activeTab === 'Profile' && <View style={styles.activeDot} />}
           </TouchableOpacity>
         </View>
      </View>

      <Modal visible={showBilanModal} animationType="slide" presentationStyle="pageSheet">
         <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#0F172A'}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{padding: 24, borderBottomWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <Text style={{fontSize: 20, fontWeight: '900', color: '#F1F5F9'}}>Bilan d'Intervention</Text>
               <TouchableOpacity onPress={() => setShowBilanModal(false)}><Ionicons name="close-circle" size={28} color="#94a3b8" /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 24}}>
               
               <TouchableOpacity 
                 style={[styles.button, {backgroundColor: '#38BDF8', marginBottom: 20}]} 
                 onPress={async () => {
                   setGeneratingBilan(true);
                   try {
                     const response = await fetch('http://10.226.140.35:3000/api/ai', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ 
                         messages: [{ role: 'user', content: `Rédige un bilan d'intervention très court et professionnel (4 phrases maximum) pour l'atelier ${selectedActivity?.theme || 'IT'} avec les élèves de ${selectedActivity?.school_name || 'l\'école'}. L'atelier s'est très bien passé.` }]
                       })
                     });
                     const data = await response.json();
                     if (data.choices && data.choices[0]) {
                       setBilanText(data.choices[0].message.content);
                     }
                   } catch (err) {
                     Alert.alert("Erreur IA", "Impossible de joindre l'API d'assistance pour le moment.");
                   }
                   setGeneratingBilan(false);
                 }}
                 disabled={generatingBilan || selectedActivity?.status === 'completed'}
               >
                 {generatingBilan ? <ActivityIndicator color="#0F172A" /> : (
                   <>
                     <Ionicons name="sparkles" size={20} color="#0F172A" style={{marginRight: 8}} />
                     <Text style={[styles.buttonText, {color: '#0F172A'}]}>Rédiger par l'IA Coach</Text>
                   </>
                 )}
               </TouchableOpacity>

                               <TextInput
                  style={styles.bilanInput}
                  multiline
                  placeholder="Ou saisissez le bilan de l'atelier ici..."
                  placeholderTextColor="#64748b"
                  value={bilanText}
                  onChangeText={setBilanText}
                  textAlignVertical="top"
                />

                {/* Consentement Parental RGPD */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingHorizontal: 4}}>
                  <TouchableOpacity 
                    style={{
                      width: 24, 
                      height: 24, 
                      borderRadius: 6, 
                      borderWidth: 2, 
                      borderColor: '#00B4A0', 
                      backgroundColor: hasParentalConsent ? '#00B4A0' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}
                    onPress={() => setHasParentalConsent(!hasParentalConsent)}
                  >
                    {hasParentalConsent && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                  </TouchableOpacity>
                  <Text style={{color: '#F1F5F9', fontWeight: 'bold', fontSize: 13, flex: 1}}>
                    J'ai obtenu le consentement parental (RGPD) pour la capture et diffusion des photos/médias.
                  </Text>
                </View>

                {/* Signature Pad */}
                {hasParentalConsent && (
                  <View style={{marginVertical: 12, backgroundColor: '#1E293B', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155'}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                      <Text style={{color: '#F1F5F9', fontWeight: '800', fontSize: 12, textTransform: 'uppercase'}}>Signature électronique du tuteur</Text>
                      <TouchableOpacity onPress={() => setSignaturePoints([])}>
                        <Text style={{color: '#ef4444', fontSize: 12, fontWeight: 'bold'}}>Effacer</Text>
                      </TouchableOpacity>
                    </View>
                    <View 
                      style={{
                        height: 150, 
                        backgroundColor: '#0F172A', 
                        borderRadius: 16, 
                        borderWidth: 1, 
                        borderColor: '#475569', 
                        overflow: 'hidden', 
                        position: 'relative'
                      }}
                      onTouchMove={(e) => {
                        const { locationX, locationY } = e.nativeEvent;
                        setSignaturePoints(prev => [...prev, { x: locationX, y: locationY }]);
                      }}
                    >
                      {signaturePoints.map((p, i) => (
                        <View 
                          key={i} 
                          style={{
                            position: 'absolute',
                            left: p.x - 2,
                            top: p.y - 2,
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#00B4A0'
                          }} 
                        />
                      ))}
                      {signaturePoints.length === 0 && (
                        <View style={{position: 'absolute', top: 60, left: 0, right: 0, justifyContent: 'center', alignItems: 'center'}}>
                          <Text style={{color: '#64748b', fontSize: 13, fontStyle: 'italic'}}>Signez ici avec votre doigt</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.button} 
                  onPress={saveBilan}
                  disabled={selectedActivity?.status === 'completed'}
                >
                  <Text style={styles.buttonText}>Enregistrer le Bilan</Text>
                </TouchableOpacity>
            </ScrollView>
         </KeyboardAvoidingView>
      </Modal>

      {/* Modal Scanner QR */}
      <Modal visible={showScanner} animationType="slide">
         <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
            <View style={{padding: 20, flexDirection: 'row', justifyContent: 'flex-end', zIndex: 10, position: 'absolute', top: 40, right: 10}}>
               <TouchableOpacity onPress={() => setShowScanner(false)}><Ionicons name="close-circle" size={40} color="#fff" /></TouchableOpacity>
            </View>
            {showScanner && (
              <CameraView 
                style={{flex: 1}} 
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={(result) => {
                  if (!result || !result.data || scannedBadge) return; 
                  
                  setScannedBadge(result.data);
                  
                  // Afficher l'alerte d'abord, puis fermer le scanner
                  Alert.alert(
                    "Badge Scanné ✅", 
                    `Le badge de l'élève a été détecté :\n${result.data}`,
                    [{ text: "OK", onPress: () => setShowScanner(false) }]
                  );
                }}
              >
                 <View style={styles.scannerOverlay}>
                   <View style={styles.scannerTarget} />
                   <Text style={styles.scannerText}>Pointez le QR code du badge élève</Text>
                 </View>
              </CameraView>
            )}
         </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E293B' }, // Header background behind safe area
  
  // Login
  loginContainer: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#0F172A' },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoBox: { width: 88, height: 88, backgroundColor: '#00B4A0', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#00B4A0', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#F1F5F9', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', marginLeft: 4, marginBottom: -8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', height: 56 },
  inputIcon: { paddingHorizontal: 16 },
  inputWithIcon: { flex: 1, height: '100%', fontSize: 16, color: '#F1F5F9' },
  button: { backgroundColor: '#00B4A0', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#00B4A0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  // Premium Header
  header: { backgroundColor: '#1E293B', padding: 24, paddingTop: Platform.OS === 'android' ? 60 : 20, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10, zIndex: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreeting: { fontSize: 26, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.5 },
  headerDate: { fontSize: 13, color: '#00B4A0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  avatar: { width: 52, height: 52, backgroundColor: '#334155', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569' },
  avatarText: { color: '#F1F5F9', fontWeight: '900', fontSize: 18 },
  avatarBadge: { position: 'absolute', top: -2, right: -2, width: 14, height: 14, backgroundColor: '#00B4A0', borderRadius: 7, borderWidth: 2, borderColor: '#1E293B' },

  // Scroll Content (Home)
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  // Gamification Card
  gamificationCard: { backgroundColor: '#1E293B', padding: 24, borderRadius: 28, marginBottom: 32, shadowColor: '#000', shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  gamiTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  gamiIconBox: { width: 48, height: 48, backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  gamiInfo: { flex: 1 },
  gamiTitle: { fontSize: 16, fontWeight: '900', color: '#F1F5F9', marginBottom: 4 },
  gamiPoints: { fontSize: 14, fontWeight: '700', color: '#00B4A0' },
  progressBarWrapper: { marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00B4A0', borderRadius: 3 },
  gamiSub: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#F1F5F9', marginBottom: 16, letterSpacing: -0.3 },
  
  // Actions
  actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: '#1E293B', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  actionCardActive: { backgroundColor: '#1E293B', borderColor: '#00B4A0', borderWidth: 2 },
  actionCardError: { backgroundColor: '#1E293B', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 12, elevation: 4 },
  actionIconContainer: { width: 48, height: 48, backgroundColor: '#334155', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 15, fontWeight: '800', color: '#F1F5F9', marginBottom: 4 },
  actionSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  actionTitleError: { fontSize: 15, fontWeight: '800', color: '#ef4444', marginBottom: 4 },
  actionSubError: { fontSize: 12, color: '#f87171', fontWeight: '500' },

  // Tasks
  taskCard: { backgroundColor: '#1E293B', padding: 24, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  taskTime: { fontSize: 14, fontWeight: '800', color: '#00B4A0' },
  badgePending: { backgroundColor: 'rgba(0,180,160,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeTextPending: { color: '#00B4A0', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  taskTitle: { fontSize: 18, fontWeight: '900', color: '#F1F5F9', marginBottom: 8 },
  taskLocation: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  taskButton: { backgroundColor: '#38BDF8', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  taskButtonText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },

  // Map
  mapContainer: { flex: 1 },
  mapBackground: { flex: 1, backgroundColor: '#1E293B', margin: 24, borderRadius: 32, alignItems: 'center', justifyContent: 'center', padding: 20 },
  mapLegend: { position: 'absolute', bottom: 120, left: 24, right: 24 },
  mapLegendCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: {width:0,height:10}, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },

  // Chatbot
  chatScroll: { padding: 24, paddingBottom: 20 },
  chatInfoBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,180,160,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 24 },
  chatInfoText: { fontSize: 12, color: '#00B4A0', fontWeight: '700' },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAi: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, backgroundColor: '#38BDF8', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity:0.3, shadowRadius:6 },
  messageBubble: { maxWidth: '75%', padding: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation: 2 },
  messageUser: { backgroundColor: '#00B4A0', borderBottomRightRadius: 8 },
  messageAi: { backgroundColor: '#1E293B', borderBottomLeftRadius: 8 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  chatInputContainer: { flexDirection: 'row', padding: 16, paddingHorizontal: 24, backgroundColor: '#0F172A', paddingBottom: Platform.OS === 'ios' ? 110 : 100 },
  chatInput: { flex: 1, height: 56, backgroundColor: '#1E293B', borderRadius: 28, paddingHorizontal: 24, fontSize: 15, color: '#F1F5F9', shadowColor: '#000', shadowOffset: {width:0,height:8}, shadowOpacity:0.3, shadowRadius:12, elevation: 5, borderColor: '#334155', borderWidth: 1 },
  chatSendBtn: { width: 56, height: 56, backgroundColor: '#00B4A0', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginLeft: 12, shadowColor: '#00B4A0', shadowOffset: {width:0,height:8}, shadowOpacity:0.3, shadowRadius:12, elevation: 5 },

  // Premium Bottom Nav
  bottomNavContainer: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1E293B', height: 72, borderRadius: 36, justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.4, shadowRadius: 24, elevation: 15, paddingHorizontal: 8, borderWidth: 1, borderColor: '#334155' },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64 },
  tabText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 4 },
  tabTextActive: { color: '#00B4A0' },
  activeDot: { position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#00B4A0' },

  // Nouveaux ajouts
  bilanInput: { height: 220, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, color: '#F1F5F9', fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scannerTarget: { width: 250, height: 250, borderWidth: 3, borderColor: '#00B4A0', backgroundColor: 'transparent', borderRadius: 24 },
  scannerText: { color: '#fff', fontSize: 16, marginTop: 24, fontWeight: 'bold' }
});
