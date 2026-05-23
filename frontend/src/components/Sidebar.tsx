import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Tag, 
  Utensils, 
  ShoppingBag, 
  ChefHat, 
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone
} from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'CAJERO'] },
    { name: 'Pedidos', path: '/orders', icon: ShoppingBag, roles: ['ADMIN', 'CAJERO', 'COCINA', 'REPARTIDOR'] },
    { name: 'WhatsApp', path: '/whatsapp', icon: Phone, roles: ['ADMIN'] },
    { name: 'Cocina', path: '/kitchen', icon: ChefHat, roles: ['ADMIN', 'COCINA', 'CAJERO'] },
    { name: 'Clientes', path: '/clients', icon: UserCircle, roles: ['ADMIN', 'CAJERO'] },
    { name: 'Productos', path: '/products', icon: Utensils, roles: ['ADMIN'] },
    { name: 'Categorías', path: '/categories', icon: Tag, roles: ['ADMIN'] },
    { name: 'Usuarios', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      <button 
        className="fixed left-4 top-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-800 shadow-lg backdrop-blur-md lg:hidden active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir navegación"
      >
        {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Utensils size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-slate-900">al cuadrado cafe</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Tel: 40887202</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pedidos y cocina</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
            {filteredItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-emerald-600" : "text-slate-400")} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight size={16} className={cn("opacity-0 transition-all", isActive ? "opacity-100 translate-x-0" : "-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-white shadow-md">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-black text-slate-900">{user?.name}</p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-black text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-100 active:scale-[0.98]"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
            
            <p className="text-center text-[10px] font-bold uppercase tracking-tighter text-slate-300">
              v2.0.4 - al cuadrado cafe
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
