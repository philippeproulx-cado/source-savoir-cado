import React, { useState } from 'react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowedModes: { short: boolean; long: boolean };
  onToggleMode: (mode: 'short' | 'long') => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

const TeacherModal: React.FC<TeacherModalProps> = ({ 
  isOpen, onClose, allowedModes, onToggleMode, currentPin, onUpdatePin 
}) => {
  const [inputPin, setInputPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === currentPin) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Code incorrect');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      onUpdatePin(newPin);
      setNewPin('');
      setShowChangePin(false);
      alert('Code modifié avec succès !');
    }
  };

  const handleClose = () => {
    setInputPin('');
    setIsAuthenticated(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 brand-font">
          👨‍🏫 Espace Enseignant
        </h2>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Entrez le code d'accès :</label>
              <input 
                type="password" 
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-widest focus:border-indigo-500 outline-none"
                placeholder="0000"
                maxLength={8}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Déverrouiller
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-3">Modes autorisés pour les élèves :</h3>
              
              <div className="flex items-center justify-between mb-3 p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-600 font-medium">📝 Prise de notes (Style Télégraphique)</span>
                <button 
                  onClick={() => onToggleMode('short')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${allowedModes.short ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${allowedModes.short ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-600 font-medium">📖 Texte Complet (Explicatif)</span>
                <button 
                  onClick={() => onToggleMode('long')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${allowedModes.long ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${allowedModes.long ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
               {!showChangePin ? (
                 <button 
                   onClick={() => setShowChangePin(true)}
                   className="text-indigo-600 text-sm font-bold underline"
                 >
                   Modifier le code d'accès
                 </button>
               ) : (
                 <form onSubmit={handleChangePin} className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500">Nouveau code :</label>
                        <input 
                            type="text" 
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Nouveau code"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold">OK</button>
                 </form>
               )}
            </div>

            <button 
                onClick={handleClose}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
                Fermer le panneau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherModal;