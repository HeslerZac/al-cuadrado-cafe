import { useState, useEffect } from 'react';
import { Phone, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, LogOut } from 'lucide-react';
import api from '../api/api';
import { cn } from '../utils/cn';

interface WhatsappStatus {
  status: 'CONNECTED' | 'DISCONNECTED' | 'LOADING';
  phone: string | null;
  qr: string | null;
}

const WhatsApp = () => {
  const [data, setData] = useState<WhatsappStatus>({
    status: 'LOADING',
    phone: null,
    qr: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/whatsapp/status');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
      setError('Error al conectar con el servidor');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás seguro de que deseas desvincular WhatsApp?')) return;
    
    setLoading(true);
    try {
      await api.post('/whatsapp/disconnect');
      fetchStatus();
    } catch (err) {
      console.error('Error disconnecting WhatsApp:', err);
      alert('Error al intentar desconectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestión de WhatsApp
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Configuración y estado de la conexión del asistente
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          <RefreshCw size={14} className={cn("animate-spin-slow", data.status === 'LOADING' && "animate-spin")} />
          Actualizando cada 3s
        </div>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-colors duration-500",
                  data.status === 'CONNECTED' ? "bg-emerald-600 text-white shadow-emerald-200" : 
                  data.status === 'LOADING' ? "bg-amber-500 text-white shadow-amber-200" :
                  "bg-red-500 text-white shadow-red-200"
                )}>
                  {data.status === 'CONNECTED' ? <Smartphone size={32} /> : <Phone size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Estado de Conexión</h2>
                    {data.status === 'CONNECTED' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <CheckCircle2 size={10} /> En Línea
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        <XCircle size={10} /> Desconectado
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">
                    {data.status === 'CONNECTED' ? 'El asistente está activo y respondiendo' : 
                     data.status === 'LOADING' ? 'Inicializando servicios de WhatsApp...' :
                     'El asistente no está vinculado actualmente'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              {data.status === 'CONNECTED' ? (
                <div className="space-y-6 w-full max-w-sm">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Número Conectado</p>
                    <p className="text-3xl font-black text-slate-900">+{data.phone}</p>
                  </div>
                  
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white border-2 border-red-100 py-4 text-sm font-black text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                    <span>Desvincular Cuenta</span>
                  </button>
                </div>
              ) : data.status === 'LOADING' ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-amber-200 animate-ping opacity-25"></div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 border-2 border-amber-100">
                      <Loader2 className="animate-spin" size={40} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Inicializando...</h3>
                    <p className="text-sm text-slate-500 font-medium">Esto puede tomar unos segundos</p>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  {data.qr ? (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm inline-block mx-auto">
                        <img 
                          src={`data:image/png;base64,${data.qr}`} 
                          alt="WhatsApp QR Code" 
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900">Conectar WhatsApp</h3>
                        <p className="text-sm text-slate-500 font-medium px-8">
                          Escanea el código QR desde tu aplicación de WhatsApp (Configuración {'>'} Dispositivos vinculados)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-4 text-slate-400">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                        <RefreshCw size={40} className="animate-spin" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest">Generando código QR...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className={cn(
                "h-2 w-2 rounded-full",
                data.status === 'CONNECTED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                data.status === 'LOADING' ? "bg-amber-500 animate-pulse" : 
                "bg-red-500"
              )}></div>
              Servicio: {data.status}
            </div>
          </div>
        </div>
        
        {/* Info Card */}
        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 sm:p-8">
          <h3 className="text-emerald-900 font-black mb-2 flex items-center gap-2">
            <CheckCircle2 size={18} />
            Consejos de Conexión
          </h3>
          <ul className="text-emerald-700 text-sm font-medium space-y-2 list-disc list-inside ml-2">
            <li>Mantén tu teléfono con conexión a Internet estable.</li>
            <li>No cierres la sesión desde el teléfono si deseas que el asistente siga funcionando.</li>
            <li>Si el QR no carga, espera unos segundos o recarga la página.</li>
            <li>El asistente usa IA para procesar pedidos automáticamente detectando productos y direcciones.</li>
          </ul>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
          <XCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default WhatsApp;
