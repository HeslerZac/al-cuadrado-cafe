import { useEffect, useState } from 'react';
import api from '../api/api';
import { ShoppingCart, Plus, Minus, MessageCircle, Utensils, Info, Heart, Star, ChevronRight, ShoppingBag, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { formatQuetzales } from '../utils/currency';

const Menu = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?available=true'),
        ]);

        const activeCategories = categoriesRes.data.filter((category: any) => category.isActive);
        const productsByCategory = productsRes.data.reduce((acc: Record<number, any[]>, product: any) => {
          acc[product.category_id] = acc[product.category_id] ?? [];
          acc[product.category_id].push(product);
          return acc;
        }, {});

        const menuData = activeCategories.map((category: any) => ({
          ...category,
          products: productsByCategory[category.id] ?? [],
        }));

        setCategories(menuData);
        if (menuData.length > 0) setActiveTab(menuData[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const confirmOrder = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, ingresa tu nombre y teléfono para el pedido.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Enviar pedido al backend (el backend hará upsert del cliente automáticamente)
      await api.post('/public/orders', {
        client_name: clientName,
        client_phone: clientPhone,
        notes: `Pedido web`,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      });

      // 2. Preparar mensaje de WhatsApp
      const message = `👋 *¡Hola! Soy ${clientName}. Me gustaría hacer un pedido:*\n\n` +
        cart.map((item) => `✅ *${item.name}* x${item.quantity}\n   _Subtotal: ${formatQuetzales(item.price * item.quantity)}_`).join('\n\n') +
        `\n\n💰 *TOTAL: ${formatQuetzales(total)}*\n\n📍 _Por favor, confírmenme para coordinar el envío._\n¡Gracias!`;
      
      const whatsappUrl = `https://wa.me/+50240887202?text=${encodeURIComponent(message)}`;
      
      // 3. Limpiar carrito y redirigir
      setCart([]);
      setClientName('');
      setClientPhone('');
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6"
        >
          <Utensils size={40} className="text-emerald-600" />
        </motion.div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparando el menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-24 lg:pb-0">
      {/* Header / Hero */}
      <div className="relative h-[300px] md:h-[400px] bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover"
            alt="Hero"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 bg-emerald-500 w-fit px-3 py-1 rounded-full">
              <Star size={14} className="text-white fill-white" />
              <span className="text-white text-xs font-black uppercase tracking-widest">Lo mejor de la zona</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight">al cuadrado cafe</h1>
            <p className="text-slate-300 font-medium text-lg max-w-xl">
              Sabores auténticos directo a tu puerta en quetzales (Q). Selecciona tus favoritos y pide por WhatsApp.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Category Tabs */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 overflow-x-auto no-scrollbar sticky top-4 z-20">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all",
                  activeTab === cat.id 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "bg-transparent text-slate-500 hover:bg-slate-50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.find(c => c.id === activeTab)?.products.map((prod: any) => (
              <motion.div 
                layout
                key={prod.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  {prod.imageUrl ? (
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <Utensils size={28} />
                    </div>
                  )}
                  <button className="text-slate-200 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{prod.name}</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed flex-1">
                  {prod.description || 'Una de nuestras especialidades preparadas al momento.'}
                </p>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</span>
                    <span className="text-2xl font-black text-slate-900">{formatQuetzales(prod.price)}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(prod)}
                    className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90 shadow-lg"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Cart */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col sticky top-4 max-h-[calc(100vh-2rem)]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Tu Orden</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {cart.length} productos seleccionados
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-white" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">¡Tu carrito está vacío!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          value={clientName} 
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-900"
                          placeholder="¿A quién buscamos?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Teléfono (WhatsApp)</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="tel" 
                          value={clientPhone} 
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-900"
                          placeholder="Ej: 50212345678"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div 
                          layout
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-4 group"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-emerald-600 font-black text-sm">{formatQuetzales(item.price * item.quantity)}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-all shadow-sm"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-all shadow-sm"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              }
              </AnimatePresence>
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-1">Total a pagar</span>
                  <span className="text-4xl font-black text-slate-950">{formatQuetzales(total)}</span>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 border border-emerald-100">
                  <Info size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    Al confirmar, se guardará tu pedido y se abrirá WhatsApp para coordinar la entrega.
                  </p>
                </div>

                <button 
                  onClick={confirmOrder}
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] group disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <MessageCircle size={24} />
                      <span className="text-lg">Confirmar Pedido</span>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
