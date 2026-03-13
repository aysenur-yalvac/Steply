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
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto py-2">
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="px-4 py-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-slate-200 text-sm truncate">{user.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>
                  <div className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Score: {user.steply_score}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No users found matching "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
