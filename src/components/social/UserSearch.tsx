"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User as UserIcon } from 'lucide-react';
import { searchUsersAction, UserSearchResult } from '@/lib/social-actions';

interface UserSearchProps {
  onSelectUser: (user: UserSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearch({ onSelectUser, placeholder = "Search by name or email...", className = "" }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await searchUsersAction(query);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (user: UserSearchResult) => {
    setQuery('');
    setIsOpen(false);
    onSelectUser(user);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center group">
        <div className="absolute left-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} /> : <Search className="w-5 h-5" strokeWidth={1.5} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-black/40 focus:bg-black/60 shadow-inner border border-white/10 text-white font-light text-sm rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-float overflow-hidden z-50">
          {isLoading && results.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold tracking-wide text-indigo-400/80 flex items-center justify-center gap-3 bg-black/20">
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} /> ANALYZING NETWORK...
            </div>
          ) : results.length > 0 ? (
            <div className="py-3 max-h-72 overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-5 mb-3 mt-1">Connections</h3>
              <ul>
                {results.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className="px-5 py-3.5 mx-2 hover:bg-white/[0.04] rounded-2xl cursor-pointer flex items-center gap-4 transition-all hover:pl-6 border border-transparent hover:border-white/10 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-white/5 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 text-slate-400 group-hover:text-indigo-300 flex items-center justify-center shrink-0 transition-all shadow-inner">
                      <UserIcon className="w-5 h-5" strokeWidth={1.25} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-bold text-slate-200 text-sm truncate group-hover:text-white transition-colors tracking-wide">{user.full_name}</div>
                      <div className="text-xs font-light text-slate-500 truncate mt-0.5">{user.email}</div>
                    </div>
                    {user.steply_score !== undefined && (
                      <div className="shrink-0 text-[10px] font-black px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-indigo-400 shadow-inner tracking-[0.1em]">
                        {user.steply_score}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 font-light flex flex-col items-center bg-black/20">
              <UserIcon className="w-8 h-8 text-slate-700 mb-3" strokeWidth={1} />
              <p>No connections found for <span className="text-white font-medium">"{query}"</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
