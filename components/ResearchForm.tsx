import React, { useState } from 'react';
import { SearchOptions, ResultType } from '../types';
import { fetchBrainstorming } from '../services/geminiService';

interface ResearchFormProps {
  onSearch: (subject: string, aspects: string[], options: SearchOptions) => void;
  isLoading: boolean;
  allowedModes: {
    short: boolean;
    long: boolean;
  };
}

const ResearchForm: React.FC<ResearchFormProps> = ({ onSearch, isLoading, allowedModes }) => {
  const [subject, setSubject] = useState('');
  const [aspects, setAspects] = useState<string[]>(['', '']); 
  const [resultType, setResultType] = useState<ResultType>('sources');
  const [includeEnglish, setIncludeEnglish] = useState(false);
  
  // Brainstorming state
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormOverview, setBrainstormOverview] = useState<string | null>(null);
  const [brainstormSuggestions, setBrainstormSuggestions] = useState<string[]>([]);

  const handleAspectChange = (index: number, value: string) => {
    const newAspects = [...aspects];
    newAspects[index] = value;
    setAspects(newAspects);
  };

  const addAspect = (value: string = '') => {
    // If the last aspect is empty, fill it instead of adding a new one
    const newAspects = [...aspects];
    const lastIdx = newAspects.length - 1;
    if (newAspects[lastIdx] === '') {
      newAspects[lastIdx] = value;
    } else {
      newAspects.push(value);
    }
    setAspects(newAspects);
  };

  const removeAspect = (index: number) => {
    if (aspects.length > 1) {
      const newAspects = aspects.filter((_, i) => i !== index);
      setAspects(newAspects);
    }
  };

  const handleBrainstorm = async () => {
    if (!subject.trim()) return;
    setIsBrainstorming(true);
    setBrainstormOverview(null);
    try {
      const result = await fetchBrainstorming(subject);
      setBrainstormOverview(result.overview);
      setBrainstormSuggestions(result.suggestedAspects);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validAspects = aspects.filter(a => a.trim() !== '');
    if (subject.trim() && validAspects.length > 0) {
      onSearch(subject, validAspects, {
        type: resultType,
        includeEnglishSources: includeEnglish
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto border-2 border-indigo-100 no-print">
      
      {/* 1. SUJET & BRAINSTORMING */}
      <div className="mb-8">
        <label htmlFor="subject" className="block text-xl font-bold text-indigo-900 mb-3 brand-font">
          1. Quel est ton sujet ?
        </label>
        <div className="flex gap-2">
            <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Les abeilles, Le système solaire..."
            className="flex-1 p-4 rounded-xl border-2 border-indigo-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all outline-none text-lg text-slate-700 placeholder-slate-400 bg-slate-50"
            disabled={isLoading}
            required
            />
            <button
                type="button"
                onClick={handleBrainstorm}
                disabled={!subject.trim() || isBrainstorming}
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-4 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Aide-moi à trouver des idées !"
            >
                <span className="text-2xl mb-1">💡</span>
                <span className="text-xs leading-none">Idées ?</span>
            </button>
        </div>

        {/* Brainstorming Results Panel */}
        {brainstormOverview && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl animate-fade-in">
                <h4 className="font-bold text-yellow-800 mb-2">Coup de pouce :</h4>
                <p className="text-sm text-slate-700 mb-4 italic">{brainstormOverview}</p>
                <p className="text-xs font-bold text-yellow-700 uppercase mb-2">Suggestions d'aspects (clique pour ajouter) :</p>
                <div className="flex flex-wrap gap-2">
                    {brainstormSuggestions.map((sugg, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => addAspect(sugg)}
                            className="px-3 py-1 bg-white border border-yellow-300 text-yellow-800 text-sm rounded-full hover:bg-yellow-200 transition-colors"
                        >
                            + {sugg}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* 2. ASPECTS */}
      <div className="mb-8">
        <label className="block text-xl font-bold text-indigo-900 mb-3 brand-font">
          2. Qu'est-ce que tu veux savoir ? (Les aspects)
        </label>
        <div className="space-y-3">
          {aspects.map((aspect, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <span className="bg-indigo-100 text-indigo-600 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">
                {index + 1}
              </span>
              <input
                type="text"
                value={aspect}
                onChange={(e) => handleAspectChange(index, e.target.value)}
                placeholder={`Aspect #${index + 1} (Ex: L'habitat, L'alimentation)`}
                className="flex-1 p-3 rounded-xl border-2 border-slate-100 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 transition-all outline-none text-slate-700 bg-white"
                disabled={isLoading}
                required={index < 1} 
              />
              {aspects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAspect(index)}
                  className="p-2 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Supprimer cet aspect"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={() => addAspect('')}
          disabled={isLoading}
          className="mt-4 flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 hover:bg-sky-50 px-4 py-2 rounded-xl transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Ajouter un autre aspect
        </button>
      </div>

      {/* 3. OPTIONS (Moved to bottom, logic updated) */}
      <div className="mb-8 bg-sky-50 p-4 rounded-2xl border border-sky-100">
        <h3 className="text-lg font-bold text-sky-800 mb-3 brand-font">⚙️ Je veux obtenir :</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            {/* SOURCES ONLY (Always available) */}
            <button
                type="button"
                onClick={() => setResultType('sources')}
                className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                  resultType === 'sources' 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
                }`}
            >
                <span className="text-xl">🔗</span>
                <span>Sources uniquement</span>
                <span className="text-[9px] font-normal opacity-90 text-center leading-tight">Pour chercher moi-même</span>
            </button>

            {/* SHORT VERSION (Gated) */}
            <button
                type="button"
                onClick={() => allowedModes.short && setResultType('short')}
                disabled={!allowedModes.short}
                className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    !allowedModes.short
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    : resultType === 'short' 
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                }`}
            >
                <span className="text-xl">{allowedModes.short ? '📝' : '🔒'}</span>
                <span>Prise de notes</span>
                <span className="text-[9px] font-normal opacity-90 text-center leading-tight">
                    {allowedModes.short ? 'Points clés brefs' : 'Bloqué par le prof'}
                </span>
            </button>

            {/* LONG VERSION (Gated) */}
            <button
                type="button"
                onClick={() => allowedModes.long && setResultType('long')}
                disabled={!allowedModes.long}
                className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    !allowedModes.long
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    : resultType === 'long' 
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                }`}
            >
                <span className="text-xl">{allowedModes.long ? '📖' : '🔒'}</span>
                <span>Texte complet</span>
                <span className="text-[9px] font-normal opacity-90 text-center leading-tight">
                    {allowedModes.long ? 'Explications détaillées' : 'Bloqué par le prof'}
                </span>
            </button>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group bg-white p-3 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors">
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${includeEnglish ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 group-hover:border-emerald-300'}`}>
                {includeEnglish && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                )}
            </div>
            <input 
                type="checkbox" 
                checked={includeEnglish} 
                onChange={(e) => setIncludeEnglish(e.target.checked)} 
                className="hidden"
            />
            <div>
                <span className="text-sm font-bold text-slate-700 block">Inclure sources anglophones</span>
                <span className="text-xs text-slate-400 block">Si les sources françaises sont rares</span>
            </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !subject.trim() || aspects.every(a => !a.trim())}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-sky-200 transform transition hover:-translate-y-1 active:translate-y-0 text-xl flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Recherche en cours...
          </>
        ) : (
          <>
            <span>Lancer la recherche !</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

export default ResearchForm;