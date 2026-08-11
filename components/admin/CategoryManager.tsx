"use client";

import { useState, useEffect } from "react";
import { Category, buildCategoryTree } from "@/lib/utils";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Save, X } from "lucide-react";
import SimpleEmojiPicker from "./SimpleEmojiPicker";
import IconPicker, { ICON_LIST } from "./IconPicker";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editing/Adding State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    parent_id: null,
    display_order: 0,
    active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Isso irá recriar todas as categorias padrão. Deseja continuar?")) return;
    setLoading(true);
    try {
        const res = await fetch("/api/admin/seed-categories");
        if (res.ok) {
            alert("Categorias restauradas com sucesso!");
            fetchCategories();
        } else {
            const data = await res.json();
            alert("Erro ao restaurar: " + data.error);
        }
    } catch (error) {
        console.error("Failed to seed", error);
    } finally {
        setLoading(false);
    }
  };

  const tree = buildCategoryTree(categories);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      display_order: cat.display_order,
      active: cat.active,
      icon: cat.icon
    });
    setIsAdding(false);
  };

  const handleAdd = (parentId: string | null = null) => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({
      name: "",
      slug: "",
      parent_id: parentId,
      display_order: 0,
      active: true,
      icon: ""
    });
  };

  const handleSave = async () => {
    setError(null);
    if (!formData.name || !formData.slug) {
        setError("Nome e Slug são obrigatórios.");
        return;
    }

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            await fetchCategories();
            setEditingId(null);
            setIsAdding(false);
        } else {
            const err = await res.json();
            setError(`Erro ao atualizar: ${err.error}`);
        }
      } else {
        // Create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            await fetchCategories();
            setEditingId(null);
            setIsAdding(false);
        } else {
            const err = await res.json();
            setError(`Erro ao criar: ${err.error}`);
        }
      }
    } catch (error) {
      console.error("Failed to save", error);
      setError("Erro ao salvar. Verifique o console.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Subcategorias também serão excluídas.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const CategoryNode = ({ node, level }: { node: Category, level: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];

    return (
      <div className="border-l border-gray-200 ml-4 first:ml-0">
        <div className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded group ${editingId === node.id ? 'bg-red-50' : ''}`}>
          <div style={{ width: level * 16 }} /> {/* Indentation */}
          
          <button 
            onClick={() => toggleExpand(node.id)}
            className={`p-1 rounded hover:bg-gray-200 text-gray-500 ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex-1">
            <span className="font-medium text-gray-800">{node.name}</span>
            <span className="text-xs text-gray-400 ml-2">/{node.slug}</span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleAdd(node.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Adicionar Subcategoria">
              <Plus size={16} />
            </button>
            <button onClick={() => handleEdit(node)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Editar">
              <Edit size={16} />
            </button>
            <button onClick={() => handleDelete(node.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => (
              <CategoryNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Estrutura de Categorias</h2>
          <div className="flex gap-2">
            <button 
                onClick={handleSeed}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-2 rounded hover:bg-gray-200"
                title="Restaurar Categorias Padrão"
            >
                Restaurar Padrão
            </button>
            <button 
                onClick={() => handleAdd(null)}
                className="flex items-center gap-2 bg-[#E60012] text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
            >
                <Plus size={16} /> Nova Categoria Raiz
            </button>
          </div>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-1">
            {tree.map(node => (
              <CategoryNode key={node.id} node={node} level={0} />
            ))}
            {tree.length === 0 && <p className="text-gray-500 italic">Nenhuma categoria encontrada.</p>}
          </div>
        )}
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200">
                    {error}
                </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <div className="flex gap-2">
                 <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 border rounded hover:bg-gray-50 text-xl w-[42px] h-[42px] flex items-center justify-center"
                        title="Adicionar Emoji"
                    >
                        😀
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-1 z-50">
                            <SimpleEmojiPicker 
                                onSelect={(emoji) => {
                                    setFormData(prev => ({ ...prev, name: emoji + " " + (prev.name || "") }));
                                    setShowEmojiPicker(false);
                                }} 
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        </div>
                    )}
                 </div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded flex-1"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') })}
                  />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-50"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full p-2 border rounded flex items-center justify-between hover:bg-gray-50 text-left bg-white"
                >
                    <div className="flex items-center gap-2">
                        {formData.icon ? (
                            <>
                                {(() => {
                                    const Icon = ICON_LIST.find(i => i.name === formData.icon)?.icon;
                                    return Icon ? <Icon size={20} className="text-gray-600" /> : <span className="text-gray-400">?</span>
                                })()}
                                <span>{formData.icon}</span>
                            </>
                        ) : (
                            <span className="text-gray-400">Selecione um ícone...</span>
                        )}
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {showIconPicker && (
                    <IconPicker 
                        selectedIcon={formData.icon || null}
                        onSelect={(iconName) => {
                            setFormData(prev => ({ ...prev, icon: iconName }));
                            setShowIconPicker(false);
                        }}
                        onClose={() => setShowIconPicker(false)}
                    />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.display_order}
                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-gray-700">Ativo</label>
            </div>

            {formData.parent_id && (
               <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  Subcategoria de: <span className="font-mono">{categories.find(c => c.id === formData.parent_id)?.name}</span>
               </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
