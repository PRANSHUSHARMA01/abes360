'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'pin' | 'supabase'>('pin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === 'Pranshu@3927') {
      sessionStorage.setItem('clasy_admin_session', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid admin password.');
    }
  };

  const authLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) { setError('Supabase is not configured.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const { data: adminProfile } = await supabase.from('admin_profiles').select('*').eq('id', data.user.id).single();
      if (!adminProfile) throw new Error('This account is not an admin.');
      sessionStorage.setItem('clasy_admin_session', 'true');
      router.push('/admin/dashboard');
    } catch (err: any) { setError(err.message || 'Login failed.'); } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-[#f5f5f7]"><Navbar /><main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-10"><div className="apple-card w-full p-7 sm:p-8">
    <div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white"><LockKeyhole className="h-5 w-5" /></div><p className="apple-eyebrow mt-5">ABESNOTES Admin</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Sign in</h1><p className="mt-2 text-sm text-zinc-500">Manage timetable and notes.</p></div>
    <div className="mt-7 flex rounded-full bg-zinc-100 p-1"><button onClick={() => { setMode('pin'); setError(''); }} className={`flex-1 rounded-full py-2 text-sm font-medium ${mode === 'pin' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}>Admin Password</button><button onClick={() => { setMode('supabase'); setError(''); }} className={`flex-1 rounded-full py-2 text-sm font-medium ${mode === 'supabase' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}>Supabase Auth</button></div>
    {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    {mode === 'pin' ? <form onSubmit={pinLogin} className="mt-5 space-y-4"><div><label className="apple-label">Admin Password</label><input required type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter Password" className="apple-text-input" /></div><button className="apple-primary-button w-full justify-center">Continue</button></form> : <form onSubmit={authLogin} className="mt-5 space-y-4"><div><label className="apple-label">Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="apple-text-input" /></div><div><label className="apple-label">Password</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="apple-text-input" /></div><button disabled={loading} className="apple-primary-button w-full justify-center">{loading ? 'Signing in…' : 'Sign in'}</button></form>}
  </div></main></div>;
}
