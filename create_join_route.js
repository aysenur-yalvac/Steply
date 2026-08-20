const fs = require('fs');

const pageContent = `import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AutoJoinHandler from './AutoJoinHandler';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(\`/auth/login?next=/join/\${token}\`);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] flex items-center justify-center p-6">
      <AutoJoinHandler token={token} />
    </div>
  );
}`;

fs.writeFileSync('src/app/join/[token]/page.tsx', pageContent, 'utf8');

const handlerContent = `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinProjectWithCode } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AutoJoinHandler({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleJoin() {
      const result = await joinProjectWithCode(token);
      
      if (!mounted) return;

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        // Redirect to dashboard after a delay
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        toast.success('Projeye baþarýyla katýldýnýz!');
        if (result.projectId) {
          router.push(\`/dashboard/projects/\${result.projectId}\`);
        } else {
          router.push('/dashboard');
        }
      }
    }

    handleJoin();

    return () => {
      mounted = false;
    };
  }, [token, router]);

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Katýlým Baþarýsýz</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl transition-colors font-medium"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Projeye Katýlýnýyor...</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
    </div>
  );
}`;

fs.writeFileSync('src/app/join/[token]/AutoJoinHandler.tsx', handlerContent, 'utf8');
console.log('Created Join route components');
