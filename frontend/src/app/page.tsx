import Hero from "@/components/layout/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Stats / Key Metrics Section */}
      <section id="stats" className="py-20 px-6 md:px-12 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[#00B4A0]/5 to-[#0B2B5B]/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-[#00B4A0] tracking-widest uppercase mb-3">Statistiques Clés</h2>
            <h3 className="text-3xl md:text-5xl font-black text-[#0B2B5B] tracking-tight">
              L'impact de la caravane en chiffres
            </h3>
            <p className="text-slate-500 mt-4 font-medium text-lg">
              Une traçabilité totale et des indicateurs de performance précis pour piloter les objectifs d'inclusion numérique.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">🏫</div>
              <p className="text-4xl font-extrabold text-[#0B2B5B] tracking-tight">45</p>
              <p className="font-bold text-slate-800 mt-2">Écoles Visités</p>
              <p className="text-slate-400 text-sm mt-1">À travers les zones rurales isolées.</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">🎒</div>
              <p className="text-4xl font-extrabold text-[#00B4A0] tracking-tight">1,824</p>
              <p className="font-bold text-slate-800 mt-2">Élèves Formés</p>
              <p className="text-slate-400 text-sm mt-1">Initié au Scratch, Python & Robotique.</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">⏱️</div>
              <p className="text-4xl font-extrabold text-[#0B2B5B] tracking-tight">280h</p>
              <p className="font-bold text-slate-800 mt-2">Heures de Formation</p>
              <p className="text-slate-400 text-sm mt-1">De code, de logique et de créativité.</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">🚚</div>
              <p className="text-4xl font-extrabold text-[#00B4A0] tracking-tight">3</p>
              <p className="font-bold text-slate-800 mt-2">Caravanes Mobiles</p>
              <p className="text-slate-400 text-sm mt-1">Parcourant le Royaume en continu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-[#00B4A0] tracking-widest uppercase mb-3">Technologie & Innovation</h2>
            <h3 className="text-3xl md:text-5xl font-black text-[#0B2B5B] tracking-tight">
              Une infrastructure robuste et intelligente
            </h3>
            <p className="text-slate-500 mt-4 font-medium text-lg">
              SmartCaravan connecte les acteurs de terrain avec les coordinateurs stratégiques grâce à des fonctionnalités à forte valeur technologique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#0B2B5B]/5 rounded-2xl flex items-center justify-center text-[#0B2B5B] text-xl font-bold mb-6">
                📍
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">Validation GPS</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Check-in géolocalisé infalsifiable par le formateur à l'arrivée sur site à l'aide de l'API GPS native de l'appareil mobile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center text-[#00B4A0] text-xl font-bold mb-6">
                🤖
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">IA Assistant (Coach)</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Un coach IA intégré sur l'application mobile pour guider et assister en direct le formateur dans la gestion de ses ateliers de code.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#0B2B5B]/5 rounded-2xl flex items-center justify-center text-[#0B2B5B] text-xl font-bold mb-6">
                📸
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">Preuves Visuelles</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Saisie de bilans terrain avec capture de photos anonymisées par l'IA et validées automatiquement conforme à la charte CNPD.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center text-[#00B4A0] text-xl font-bold mb-6">
                📴
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">Offline-First</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Synchronisation automatique de toutes les activités et rapports saisis hors-ligne dès le retour d'une connexion réseau stable.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#0B2B5B]/5 rounded-2xl flex items-center justify-center text-[#0B2B5B] text-xl font-bold mb-6">
                📊
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">Tableau de Bord Stratégique</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Visualisation cartographique interactive, timelines d'interventions et rapports analytiques pour une prise de décision rapide.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl border border-slate-100 hover:border-[#00B4A0]/20 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center text-[#00B4A0] text-xl font-bold mb-6">
                🎮
              </div>
              <h4 className="text-xl font-extrabold text-[#0B2B5B] mb-3">Gamification Terrain</h4>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                Un système de récompenses de points et de badges pour encourager et motiver les formateurs dans la réalisation de leurs objectifs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-[#00B4A0] tracking-widest uppercase mb-3">Fonctionnement</h2>
            <h3 className="text-3xl md:text-5xl font-black text-[#0B2B5B] tracking-tight">
              Une boucle d'impact simplifiée
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0B2B5B] text-white font-extrabold rounded-full flex items-center justify-center text-xl mx-auto shadow-lg shadow-[#0B2B5B]/20">
                1
              </div>
              <h4 className="text-lg font-bold text-[#0B2B5B]">Planifier</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Le coordinateur crée et attribue les interventions à l'aide de l'outil de planning centralisé.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#00B4A0] text-white font-extrabold rounded-full flex items-center justify-center text-xl mx-auto shadow-lg shadow-[#00B4A0]/20">
                2
              </div>
              <h4 className="text-lg font-bold text-[#0B2B5B]">Intervenir</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Le formateur sur le terrain valide sa présence par GPS et réalise les ateliers assisté par l'IA.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0B2B5B] text-white font-extrabold rounded-full flex items-center justify-center text-xl mx-auto shadow-lg shadow-[#0B2B5B]/20">
                3
              </div>
              <h4 className="text-lg font-bold text-[#0B2B5B]">Analyser</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Les indicateurs de réussite, d'impact et les rapports sont consolidés automatiquement sur le Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0B2B5B] to-[#1a4b8f] rounded-[40px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#00B4A0]/20 to-transparent rounded-full blur-2xl -z-10" />
          
          <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Prêt à transformer l'éducation <br /> numérique en zone rurale ?
          </h3>
          <p className="text-[#00B4A0] font-bold text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-90">
            Rejoignez l'initiative et suivez chaque kilomètre parcouru au service du code et de l'innovation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-10 py-4.5 bg-[#00B4A0] hover:bg-[#009685] text-white font-bold rounded-2xl shadow-lg transition-all"
            >
              Accéder au Dashboard
            </Link>
            <Link 
              href="/login" 
              className="px-10 py-4.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl transition-all"
            >
              Se Connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Minimaliste */}
      <footer className="py-12 px-6 md:px-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-2xl font-black text-[#0B2B5B]">SmartCaravan</span>
          <p className="text-sm font-medium text-[#0B2B5B]/50">
            © 2026 <span className="font-bold text-[#0B2B5B]">TECH-57</span>. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
