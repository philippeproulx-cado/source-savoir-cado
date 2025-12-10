import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b-4 border-sky-400 py-6 mb-8 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-600 mb-2 tracking-tight">
          🔍 Explorateur de Savoir
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Tes recherches scolaires, fiables et sérieuses !
        </p>
      </div>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    </header>
  );
};

export default Header;