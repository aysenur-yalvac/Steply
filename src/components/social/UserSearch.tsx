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
        <div className="absolute left-4 text-slate-400 group-focus-within:text-dusty-rose transition-colors">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-dusty-rose" /> : <Search className="w-4 h-4" />}
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
          className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-dusty-rose/40 focus:ring-4 focus:ring-dusty-rose/5 transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
          {isLoading && results.length === 0 ? (
            <div className="p-5 text-center text-sm font-medium text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-dusty-rose" /> Searching network...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2 max-h-72 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-1">People</h3>
              <ul>
                {results.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className="px-4 py-3 mx-2 hover:bg-dusty-rose/5 rounded-xl cursor-pointer flex items-center gap-4 transition-all hover:pl-5 border border-transparent hover:border-dusty-rose/10 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-dusty-rose/10 group-hover:border-dusty-rose/20 text-slate-400 group-hover:text-dusty-rose flex items-center justify-center shrink-0 transition-colors shadow-sm">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">{user.full_name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{user.email}</div>
                      {user.institution && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">{user.institution}</div>
                      )}
                    </div>
                    {user.steply_score !== undefined && (
                      <div className="shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-slate-50 border border-slate-100 text-dusty-rose shadow-inner tracking-wider">
                        SCORE: {user.steply_score}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-400 flex flex-col items-center">
              <UserIcon className="w-8 h-8 text-slate-600 mb-2" />
              <p>No users found matching "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
