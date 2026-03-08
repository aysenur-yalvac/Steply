"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-xl tracking-tight">Steply</span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 mt-4 md:mt-0`}>
        <Link href="/auth/login" className="text-sm font-medium text-center text-slate-300 hover:text-white transition-colors py-2 md:px-4">
          Giriş Yap
        </Link>
        <Link href="/auth/register" className="text-sm font-medium text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 px-4 transition-colors">
          Kayıt Ol
        </Link>
      </div>
    </nav>
  );
}
