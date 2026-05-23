import { useEffect, useState } from 'react';
import api from '../api/api';
import { ShoppingBag, Search, Filter, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { formatQuetzales } from '../utils/currency';

const statusColors: any = {
  RECIBIDO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-700 border-blue-200',
  LISTO: 'bg-green-100 text-green-700 border-green-200',
  EN_CAMINO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ENTREGADO: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELADO: 'bg-red-100 text-red-700 border-red-200',
};

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filter 
    ? orders.filter(o => o.status === filter) 
    : orders;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag size={32} className="text-blue-600" />
            Pedidos
          </h1>
          <p className="text-slate-500 mt-1">Historial y gestión de todos los pedidos</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={20} />
          Nuevo Pedido
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o ID..."
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="RECIBIDO">Recibido</option>
              <option value="EN_PREPARACION">En Preparación</option>
              <option value="LISTO">Listo</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Pedido</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Total</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Cargando pedidos...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No se encontraron pedidos</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900">#{order.id.toString().padStart(4, '0')}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{order.source}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{order.client?.name}</div>
                    <div className="text-xs text-slate-400">{order.client?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter",
                      statusColors[order.status]
                    )}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-900">{formatQuetzales(order.total)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link 
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
