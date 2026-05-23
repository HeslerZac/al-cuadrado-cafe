import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Utensils, Plus, Search, Check, X, Tag, Pencil, Trash2, Upload, ImageOff } from 'lucide-react';
import { formatQuetzales } from '../utils/currency';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, category_id: 0, imageUrl: '' });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, category_id: categories[0]?.id ?? 0, imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name ?? '',
      description: product.description ?? '',
      price: Number(product.price ?? 0),
      category_id: product.category_id ?? product.category?.id ?? 0,
      imageUrl: product.imageUrl ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, category_id: 0, imageUrl: '' });
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, imageUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price), category_id: Number(formData.category_id) };
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto');
    }
  };

  const toggleStatus = async (prod: any) => {
    try {
      await api.patch(`/products/${prod.id}`, { isAvailable: !prod.isAvailable });
      fetchData();
    } catch (err) {
      alert('Error al actualizar disponibilidad');
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = `${prod.name} ${prod.description ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? String(prod.category_id) === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Utensils size={32} className="text-blue-600" />
            Productos
          </h1>
          <p className="text-slate-500 mt-1">Catálogo de platos y bebidas</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Imagen</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold">Precio</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Cargando catálogo...</td>
                </tr>
              ) : filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{prod.name}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{prod.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Utensils size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {prod.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {formatQuetzales(prod.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      prod.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {prod.isAvailable ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(prod)}
                        className={`p-2 rounded-lg transition-colors ${
                          prod.isAvailable ? 'text-red-400 hover:bg-red-50' : 'text-green-400 hover:bg-green-50'
                        }`}
                        title={prod.isAvailable ? 'Marcar agotado' : 'Marcar disponible'}
                      >
                        {prod.isAvailable ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('¿Eliminar producto?')) {
                            try {
                              await api.delete(`/products/${prod.id}`);
                              fetchData();
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select 
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: +e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: +e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Foto de la comida</label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Vista previa"
                      className="h-20 w-20 rounded-xl border border-slate-200 object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                      <ImageOff size={24} />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 cursor-pointer">
                      <Upload size={16} />
                      Subir foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                    </label>
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="ml-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <X size={14} />
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="O pega una URL de imagen"
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
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
                  {editingProduct ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
