import { useEffect, useState } from 'react';
import api from '../api/api';
import { ChefHat, Clock, CheckCircle2, Package, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const Kitchen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/kitchen/orders');
      // Solo mostrar RECIBIDO y EN_PREPARACION
      const filteredOrders = res.data.filter((o: any) => o.status === 'RECIBIDO' || o.status === 'EN_PREPARACION');
      setOrders(filteredOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/kitchen/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ChefHat size={32} className="text-blue-600" />
            Panel de Cocina
          </h1>
          <p className="text-slate-500 mt-1">Pedidos en preparación</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-700">Actualizando automáticamente</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Package size={64} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">No hay pedidos pendientes</h2>
          <p className="text-slate-500">Cuando lleguen nuevos pedidos aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={clsx(
                "bg-white rounded-2xl shadow-sm border-l-8 transition-all overflow-hidden flex flex-col h-full",
                order.status === 'RECIBIDO' ? 'border-yellow-500 ring-1 ring-yellow-100' :
                'border-blue-500 ring-1 ring-blue-100'
              )}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orden</span>
                    <h2 className="text-2xl font-black text-slate-900">#{order.id.toString().padStart(4, '0')}</h2>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <div className="flex items-center gap-1 justify-end font-medium">
                      <Clock size={14} />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <span>{order.client?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 text-sm">{order.client?.phone}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded flex items-center justify-center text-xs font-black">
                          {item.quantity}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{item.product.name}</p>
                          {item.notes && <p className="text-xs text-red-500 font-medium italic">Nota: {item.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{order.address}</span>
                  </div>
                )}
                
                {order.notes && (
                  <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                    <MessageSquare size={16} className="shrink-0 mt-0.5" />
                    <span className="font-medium italic">{order.notes}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                {order.status === 'RECIBIDO' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'EN_PREPARACION')}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    ▶ Iniciar Preparación
                    <ArrowRight size={20} />
                  </button>
                )}
                {order.status === 'EN_PREPARACION' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'LISTO')}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-black hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    ✅ Marcar Listo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
