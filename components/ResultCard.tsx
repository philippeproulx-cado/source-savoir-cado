import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ResearchResult } from '../types';

interface ResultCardProps {
  result: ResearchResult;
  printPreview?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, printPreview = false }) => {
  const isSourcesOnly = result.resultType === 'sources';

  if (printPreview) {
    return (
      <div className="mb-6 border-b border-slate-300 pb-4 last:border-0 break-inside-avoid">
        <h3 className="text-xl font-bold text-black mb-2 uppercase tracking-tight font-serif">
          {result.aspect}
        </h3>
        
        {!isSourcesOnly && (
            <div className="prose prose-slate max-w-none mb-2 text-black text-justify leading-snug font-serif text-sm">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
        )}

        <div className="mt-2 pt-1 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
            Sources :
          </h4>
          {result.sources.length > 0 ? (
            <ul className="list-none p-0 text-[10px] leading-tight">
              {result.sources.map((source, idx) => (
                <li key={idx} className="mb-0.5 text-slate-600">
                  <span className="font-semibold text-black">{source.title}</span>
                  <span className="text-slate-400 ml-1 italic text-[9px]"> — {source.uri}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-slate-400 italic">Aucune source directe citée.</p>
          )}
        </div>
      </div>
    );
  }

  // Standard colorful card view
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
      <div className="bg-sky-100 p-4 border-b border-sky-200 flex items-center gap-3 rounded-t-3xl print:bg-transparent print:border-b print:border-slate-300">
        <div className="bg-white p-2 rounded-full text-sky-500 print:hidden">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-sky-800 capitalize brand-font print:text-black">{result.aspect}</h3>
      </div>
      
      <div className="p-6">
        {/* If Not Sources Only, show the summary text */}
        {!isSourcesOnly && (
            <div className="prose prose-indigo prose-lg max-w-none mb-6 text-slate-600 print:text-black">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
        )}

        {/* If Sources Only, show a helpful message */}
        {isSourcesOnly && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 italic">
                <p>🔍 Voici une sélection de pages vérifiées pour trouver toi-même les réponses sur <strong>{result.aspect}</strong>.</p>
            </div>
        )}

        <div className={`mt-2 ${!isSourcesOnly ? 'pt-6 border-t border-slate-100' : ''}`}>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 print:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Sources vérifiées
          </h4>
          
          {result.sources.length > 0 ? (
            <div className="flex flex-wrap gap-2 print:block">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`source-link inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors truncate max-w-xs print:bg-transparent print:border-0 print:p-0 print:text-black print:mb-1 print:block print:w-full print:max-w-none print:whitespace-normal
                    ${isSourcesOnly 
                        ? 'bg-white border-emerald-200 text-emerald-700 shadow-sm hover:bg-emerald-50 py-3 px-4 text-base' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
                    }`}
                  title={source.title}
                >
                  <span className="truncate print:whitespace-normal">{source.title}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0 print:hidden" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucune source directe retournée.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;