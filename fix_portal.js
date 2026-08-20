const fs = require('fs');
const path = require('path');

const modalPath = 'src/components/dashboard/JoinProjectModal.tsx';
const modalContent = `'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Loader2, ArrowRight } from 'lucide-react';
import { joinProjectWithCodeAction } from '@/app/dashboard/actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinProjectModal({ isOpen, onClose }: JoinProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await joinProjectWithCodeAction(code.trim().toUpperCase());
      if (!result.success) {
        setError(result.error || 'Katılım başarısız oldu.');
      } else {
        toast.success('Projeye başarıyla katıldınız!');
        onClose();
        if (result.projectId) {
          router.push(\`/dashboard/projects/\${result.projectId}\`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Katılım başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* BackDrop Kapatma */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Kutusu */}
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5"/>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <Key className="w-6 h-6"/>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Projeye Katıl</h3>
            <p className="text-xs text-slate-400">6 haneli katılım kodunu giriniz</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: STP-A2C4"
            maxLength={10}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Projeye Katıl'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
`;
fs.writeFileSync(modalPath, modalContent, 'utf8');

const switcherPath = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let switcherContent = fs.readFileSync(switcherPath, 'utf8');
switcherContent = switcherContent.replace(
  /\{isJoinModalOpen && <JoinProjectModal onClose=\{\(\) => setIsJoinModalOpen\(false\)\} \/>\}/g,
  `<JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />`
);
fs.writeFileSync(switcherPath, switcherContent, 'utf8');

console.log('Fixed JoinProjectModal with createPortal and updated DashboardViewSwitcher');
