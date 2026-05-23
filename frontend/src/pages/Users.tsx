import { useEffect, useState } from 'react';
import api from '../api/api';
import { Users as UsersIcon, Plus, Shield, Mail, Pencil, X, Check, Trash2 } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CAJERO' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'CAJERO' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name ?? '',
      email: user.email ?? '',
      password: '', // Password stays empty unless changing
      role: user.role ?? 'CAJERO',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'CAJERO' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingUser) {
        if (!payload.password) delete (payload as any).password;
        await api.patch(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      alert(editingUser ? 'Error al actualizar usuario' : 'Error al crear usuario');
    }
  };

  const toggleStatus = async (user: any) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UsersIcon size={32} className="text-blue-600" />
            Usuarios
          </h1>
          <p className="text-slate-500 mt-1">Gestión de personal y accesos</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Nombre</th>
                <th className="px-6 py-4 font-bold">Email / Acceso</th>
                <th className="px-6 py-4 font-bold">Rol</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Cargando personal...</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                        {u.name[0]}
                      </div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-slate-400" />
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'CAJERO' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'COCINA' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(u)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-400 hover:bg-green-50'
                        }`}
                        title={u.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {u.isActive ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('¿Eliminar usuario?')) {
                            try {
                              await api.delete(`/users/${u.id}`);
                              fetchUsers();
                            } catch (err) {
                              alert('Error al eliminar');
                            }
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña {editingUser && <span className="text-xs font-normal text-slate-400">(dejar vacío para no cambiar)</span>}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CAJERO">CAJERO</option>
                  <option value="COCINA">COCINA</option>
                  <option value="REPARTIDOR">REPARTIDOR</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
