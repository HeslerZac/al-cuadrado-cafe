import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Utensils, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] p-4 font-sans overflow-hidden relative">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px] opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] grid md:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
      >
        {/* Left Side: Illustration & Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-emerald-600 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Utensils size={24} className="text-emerald-600" />
              </div>
              <span className="text-xl font-bold tracking-tight">al cuadrado cafe</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                Gestiona tu éxito culinario.
              </h1>
              <p className="text-emerald-50/80 text-lg font-medium leading-relaxed max-w-sm">
                La plataforma inteligente para controlar pedidos, cocina y clientes en tiempo real.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={18} className="text-emerald-300" />
                </div>
                <p className="text-sm font-semibold">Infraestructura segura 256-bit</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200/50">Version 2.0.4</span>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                <div className="w-2 h-2 rounded-full bg-emerald-300/30" />
                <div className="w-2 h-2 rounded-full bg-emerald-300/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Inicia Sesión</h2>
            <p className="text-slate-500 font-medium">Accede al panel administrativo de al cuadrado cafe.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="ejemplo@alcuadrado.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">¿Olvidaste?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:opacity-70 disabled:pointer-events-none group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Entrar al Panel</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm font-medium">
              ¿Problemas para acceder? <span className="text-slate-900 font-bold cursor-pointer hover:underline">Contacta a soporte</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
