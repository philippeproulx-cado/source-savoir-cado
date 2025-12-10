import React, { useState } from 'react';
import Header from './components/Header';
import ResearchForm from './components/ResearchForm';
import ResultCard from './components/ResultCard';
import TeacherModal from './components/TeacherModal';
import { fetchAspectResearch } from './services/geminiService';
import { ResearchResult, SearchOptions } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<ResearchResult[] | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Teacher Mode State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherPin, setTeacherPin] = useState('0000');
  const [allowedModes, setAllowedModes] = useState({
    short: false, // Locked by default
    long: false   // Locked by default
  });

  const handleSearch = async (subject: string, aspects: string[], options: SearchOptions) => {
    setIsLoading(true);
    setCurrentSubject(subject);
    setResults(null);
    setIsPrintPreview(false);

    try {
      // Fetch research for all aspects in parallel
      const promises = aspects.map(aspect => fetchAspectResearch(subject, aspect, options));
      const fetchedResults = await Promise.all(promises);
      setResults(fetchedResults);
    } catch (error) {
      console.error("Global search error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setResults(null);
    setCurrentSubject('');
    setIsPrintPreview(false);
  };

  // Toggle between standard view and "Paper" view
  const togglePrintPreview = () => {
    setIsPrintPreview(!isPrintPreview);
  };

  const handleToggleMode = (mode: 'short' | 'long') => {
    setAllowedModes(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  // --------------------------------------------------------------------------
  // RENDER : PRINT PREVIEW MODE
  // --------------------------------------------------------------------------
  if (isPrintPreview && results) {
    return (
      <div className="bg-white min-h-screen font-serif text-black p-8 max-w-[21cm] mx-auto">
        {/* Navigation Bar (Hidden when actually printing) */}
        <div className="no-print fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 shadow-lg z-50 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-bold text-yellow-400">Mode Impression</span> : 
            Le document est prêt. Utilisez les fonctions de votre navigateur.
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => window.print()} 
              className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-bold text-sm transition-colors"
             >
               🖨️ Ouvrir le dialogue d'impression
             </button>
             <button 
              onClick={togglePrintPreview} 
              className="bg-white text-slate-900 px-4 py-2 rounded font-bold text-sm hover:bg-slate-200 transition-colors"
             >
               🔙 Retour à l'application
             </button>
          </div>
        </div>

        {/* Content Start (Added margin top to avoid overlap with fixed nav) */}
        <div className="mt-16 print:mt-0">
          {/* Using div instead of header to avoid global print:hidden css rules */}
          <div className="text-center border-b-2 border-black pb-4 mb-8">
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-widest">Dossier de Recherche</h1>
            <h2 className="text-2xl italic">Sujet : {currentSubject}</h2>
          </div>

          <main>
            {results.map((result, index) => (
              <ResultCard key={index} result={result} printPreview={true} />
            ))}
          </main>

          {/* Using div instead of footer to avoid global print:hidden css rules */}
          <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>Document généré par l'Explorateur de Savoir. Sources vérifiées.</p>
            <p>{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER : STANDARD APP MODE
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen pb-12 bg-sky-50 text-slate-700 relative">
      <Header />
      
      <main className="container mx-auto px-4">
        {!results && (
          <div className="animate-fade-in-up">
            <ResearchForm 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              allowedModes={allowedModes}
            />
          </div>
        )}

        {results && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-700 brand-font">
                    Résultats pour : <span className="text-sky-600">{currentSubject}</span>
                  </h2>
                  <p className="text-slate-500">Voici ce que nous avons trouvé dans les sources fiables.</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={togglePrintPreview}
                    className="flex-1 md:flex-none justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                    title="Voir une version simplifiée pour l'impression"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                     Version Imprimable
                   </button>
                   <button 
                    type="button"
                    onClick={resetSearch}
                    className="bg-white hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                     Nouvelle recherche
                   </button>
               </div>
            </div>

            <div className="grid gap-8">
              {results.map((result, index) => (
                <div key={index} className="result-card-wrapper">
                    <ResultCard result={result} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Teacher Access Button */}
      <div className="fixed bottom-4 right-4 z-40 no-print">
        <button
          onClick={() => setIsTeacherModalOpen(true)}
          className="bg-slate-200 hover:bg-indigo-600 hover:text-white text-slate-400 p-2 rounded-full shadow-sm transition-all"
          title="Accès Enseignant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>

      <TeacherModal 
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        allowedModes={allowedModes}
        onToggleMode={handleToggleMode}
        currentPin={teacherPin}
        onUpdatePin={setTeacherPin}
      />
    </div>
  );
};

export default App;