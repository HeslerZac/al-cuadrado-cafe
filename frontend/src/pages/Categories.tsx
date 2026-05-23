import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Tag, Plus, Check, X, Pencil, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name ?? '',
      description: cat.description ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      fetchCategories();
      closeModal();
    } catch (err) {
      alert(editingCategory ? 'Error al actualizar categoría' : 'Error al crear categoría');
    }
  };

  const toggleStatus = async (cat: any) => {
    try {
      await api.patch(`/categories/${cat.id}`, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Tag size={32} className="text-blue-600" />
            Categorías
          </h1>
          <p className="text-slate-500 mt-1">Gestión de tipos de productos</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Nombre</th>
              <th className="px-6 py-4 font-bold">Descripción</th>
              <th className="px-6 py-4 font-bold">Estado</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Cargando categorías...</td>
              </tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{cat.description || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {cat.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(cat)}
                      className={`p-2 rounded-lg transition-colors ${
                        cat.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-400 hover:bg-green-50'
                      }`}
                      title={cat.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {cat.isActive ? <X size={18} /> : <Check size={18} />}
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('¿Eliminar categoría?')) {
                          try {
                            await api.delete(`/categories/${cat.id}`);
                            fetchCategories();
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
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
                  {editingCategory ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
