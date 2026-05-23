import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  History,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';
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

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      await fetchOrder();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando detalle...</div>;
  if (!order) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pedido #{order.id.toString().padStart(4, '0')}</h1>
            <p className="text-slate-500 mt-1">Detalles completos y seguimiento</p>
          </div>
        </div>

        {/* Botones de acción según estado */}
        <div className="flex items-center gap-2">
          {order.status === 'RECIBIDO' && (
            <span className="px-8 py-3 bg-blue-100 text-blue-700 text-lg font-black rounded-2xl border-2 border-blue-200 flex items-center gap-2">
              Recibido
            </span>
          )}
          {order.status === 'EN_PREPARACION' && (
            <span className="px-8 py-3 bg-orange-100 text-orange-700 text-lg font-black rounded-2xl border-2 border-orange-200 flex items-center gap-2">
              En Preparación
            </span>
          )}
          {order.status === 'LISTO' && (
            <button
              onClick={() => handleUpdateStatus('ENTREGADO')}
              disabled={updating}
              className="px-8 py-3 bg-green-600 text-white text-lg font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {updating ? 'Procesando...' : '📦 Marcar como Entregado'}
            </button>
          )}
          {order.status === 'ENTREGADO' && (
            <span className="px-8 py-3 bg-green-100 text-green-700 text-lg font-black rounded-2xl border-2 border-green-200 flex items-center gap-2">
              <ShoppingBag size={24} />
              Completado
            </span>
          )}
          {order.status === 'CANCELADO' && (
            <span className="px-8 py-3 bg-red-100 text-red-700 text-lg font-black rounded-2xl border-2 border-red-200 flex items-center gap-2">
              Cancelado
            </span>
          )}

          {order.status !== 'ENTREGADO' && order.status !== 'CANCELADO' && (
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                  handleUpdateStatus('CANCELADO');
                }
              }}
              disabled={updating}
              className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              ✖ Cancelar Pedido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-blue-600" />
                Productos del Pedido
              </h2>
              <span className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
                statusColors[order.status]
              )}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-500">
                      {item.quantity}x
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.product.name}</p>
                      {item.notes && <p className="text-xs text-red-500 italic">Nota: {item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatQuetzales(item.subtotal)}</p>
                      <p className="text-xs text-slate-400">{formatQuetzales(item.unitPrice)} c/u</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatQuetzales(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatQuetzales(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                Historial de Estados
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {order.statusHistory.map((h: any, idx: number) => (
                  <div key={h.id} className="relative flex gap-4">
                    {idx !== order.statusHistory.length - 1 && (
                      <div className="absolute left-2.5 top-7 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className={clsx(
                      "w-5 h-5 rounded-full mt-1 z-10",
                      idx === 0 ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-slate-200"
                    )} />
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">{h.status.replace('_', ' ')}</span>
                        <span className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{h.comment}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Por: {h.changedBy || 'Sistema'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserIcon size={20} className="text-blue-600" />
                Información del Cliente
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{order.client?.name}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Phone size={12} />
                    {order.client?.phone}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex gap-3 text-sm">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">Dirección de Entrega</p>
                    <p className="text-slate-500">{order.address || 'No especificada'}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <Calendar size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">Fecha del Pedido</p>
                    <p className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <Clock size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">Hora del Pedido</p>
                    <p className="text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-600" />
                Notas del Pedido
              </h2>
            </div>
            <div className="p-6">
              {order.notes ? (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm italic border border-blue-100">
                  "{order.notes}"
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Sin notas adicionales</p>
              )}

              {order.originalMessage && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Mensaje Original</p>
                  <div className="bg-slate-50 text-slate-600 p-3 rounded-lg text-xs font-mono break-words">
                    {order.originalMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
