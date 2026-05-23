import { useEffect, useState } from 'react';
import api from '../api/api';
import { 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  AlertCircle,
  Calendar,
  ChevronRight,
  Banknote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { formatQuetzales } from '../utils/currency';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredToday: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders');
      const orders = res.data;
      const today = new Date().toLocaleDateString();
      
      const statsData = {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'RECIBIDO' || o.status === 'EN_PREPARACION').length,
        deliveredToday: orders.filter((o: any) => o.status === 'ENTREGADO' && new Date(o.createdAt).toLocaleDateString() === today).length,
        totalRevenue: orders.reduce((acc: number, o: any) => o.status !== 'CANCELADO' ? acc + Number(o.total) : acc, 0),
      };
      setStats(statsData);
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Ventas Totales', value: formatQuetzales(stats.totalRevenue), icon: Banknote, color: 'text-emerald-600', trend: '+12.5%', trendType: 'up' },
    { name: 'Pedidos Totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', trend: '+5.2%', trendType: 'up' },
    { name: 'En Preparación', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', trend: '-2.1%', trendType: 'down' },
    { name: 'Entregados Hoy', value: stats.deliveredToday, icon: Package, color: 'text-purple-600', trend: '+8.4%', trendType: 'up' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <TrendingUp size={16} />
            <span>Resumen General</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm font-semibold text-slate-600">
          <Calendar size={18} className="text-slate-400" />
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <motion.div 
            key={stat.name} 
            variants={item}
            className="surface-card p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-110", stat.color.replace('text', 'bg'))} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className={cn("p-3 rounded-2xl", stat.color.replace('text-', 'bg-').replace('600', '50'))}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                stat.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            
            <div className="mt-4 relative z-10">
              <p className="text-slate-500 text-sm font-semibold">{stat.name}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {loading ? <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" /> : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 surface-card flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pedidos Recientes</h2>
              <p className="text-sm text-slate-500 font-medium">Última actividad detectada en el sistema</p>
            </div>
            <Link to="/orders" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-xl" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium italic">No hay pedidos registrados hoy.</div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400">
                        #{order.id.toString().slice(-3)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{order.client?.name || 'Venta Rápida'}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">{formatQuetzales(order.total)}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        order.status === 'RECIBIDO' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div variants={item} className="surface-card p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Alertas Activas</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-900">Demora en Cocina</p>
                  <p className="text-xs text-amber-700 font-medium mt-1">Hay 3 pedidos esperando hace más de 15 min.</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                <Package className="text-blue-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900">Stock Crítico</p>
                  <p className="text-xs text-blue-700 font-medium mt-1">Quedan pocas existencias de 'Gaseosa'.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/30" />
            <h3 className="text-2xl font-bold leading-tight relative z-10">Optimiza tu tiempo.</h3>
            <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed relative z-10">
              Recuerda marcar los pedidos como "Listos" para notificar al repartidor automáticamente.
            </p>
            <button className="mt-8 flex items-center gap-2 text-primary font-bold text-sm group/btn relative z-10">
              Ver tutoriales <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
