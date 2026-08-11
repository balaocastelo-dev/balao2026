"use client";

import React, { useState, useEffect } from "react";
import { Product, Category, buildCategoryTree } from "@/lib/utils";
import { searchProducts } from "@/lib/searchUtils";
import { Edit, Trash2, Plus, Save, X, Search, CheckSquare, Square, Upload, Copy, AlertTriangle, ImageOff, Image as ImageIcon, Video, DollarSign, Package, ChevronDown, Percent, Sparkles, BrainCircuit, FileText } from "lucide-react";
import Image from "next/image";
import ProductVideo from "@/components/ProductVideo";

// Types for AI Enrichment
interface EnrichmentPreview {
    id: string;
    name: string;
    original_specs: Record<string, any>;
    new_specs: Record<string, any>;
    original_description: string;
    new_description: string;
    seo_title?: string;
    seo_description?: string;
    bullet_points?: string[];
    json_ld?: any;
    status: 'success' | 'error';
    error?: string;
}

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Helper to flatten category tree with level info
const flattenCategoryTree = (categories: Category[], level = 0): { category: Category, level: number }[] => {
  let result: { category: Category, level: number }[] = [];
  categories.forEach(cat => {
    result.push({ category: cat, level });
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategoryTree(cat.children, level + 1));
    }
  });
  return result;
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Create sorted and flattened categories for display
  const sortedCategories = React.useMemo(() => {
    const tree = buildCategoryTree(categories);
    return flattenCategoryTree(tree);
  }, [categories]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Bulk Action State
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPricePercent, setBulkPricePercent] = useState<number>(0);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // AI Enrichment State
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [enrichmentStep, setEnrichmentStep] = useState<'loading' | 'preview' | 'complete'>('loading');
  const [enrichmentPreviews, setEnrichmentPreviews] = useState<EnrichmentPreview[]>([]);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);

  // Edit/Create State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);

  // Migration State
  const [showMigration, setShowMigration] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ total: 0, current: 0, success: 0, error: 0 });
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/products");
        if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
        const res = await fetch("/api/categories");
        if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  // Helper to check if an image URL is valid and loadable
  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // AI Enrichment Functions
  const handleEnrichSelected = async () => {
    if (selectedIds.size === 0) return;
    
    setShowEnrichmentModal(true);
    setEnrichmentStep('loading');
    setEnrichmentPreviews([]);
    setEnrichmentProgress(0);

    const selectedProducts = products.filter(p => selectedIds.has(p.id));
    const total = selectedProducts.length;
    const results: EnrichmentPreview[] = [];

    // Process sequentially for accurate progress tracking
    for (let i = 0; i < total; i++) {
        const p = selectedProducts[i];
        try {
            const res = await fetch('/api/admin/enrich-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    products: [{ 
                        id: p.id, 
                        name: p.name, 
                        specs: p.specs || {}, 
                        description: p.description || "" 
                    }]
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                results.push({
                    id: p.id,
                    name: p.name,
                    original_specs: p.specs || {},
                    new_specs: {},
                    original_description: p.description || "",
                    new_description: "",
                    status: 'error',
                    error: errorData.error || "Failed"
                });
            } else {
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    results.push(data.results[0]);
                }
            }
        } catch (err: any) {
             results.push({
                id: p.id,
                name: p.name,
                original_specs: p.specs || {},
                new_specs: {},
                original_description: p.description || "",
                new_description: "",
                status: 'error',
                error: err.message
            });
        }

        // Update progress
        setEnrichmentProgress(Math.round(((i + 1) / total) * 100));
        setEnrichmentPreviews([...results]);
    }

    setEnrichmentStep('preview');
  };

  const confirmEnrichment = async () => {
      setEnrichmentStep('loading');
      try {
          // Filter only successful ones
          const updates = enrichmentPreviews
            .filter(p => p.status === 'success')
            .map(p => ({
                id: p.id,
                specs: {
                    ...p.new_specs,
                    seo_title: p.seo_title,
                    seo_description: p.seo_description,
                    bullet_points: p.bullet_points,
                    json_ld: p.json_ld
                },
                description: p.new_description
            }));

          const res = await fetch('/api/admin/enrich-product', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates })
          });

          if (res.ok) {
              setEnrichmentStep('complete');
              fetchProducts(); // Refresh list
              setSelectedIds(new Set()); // Clear selection
          } else {
              throw new Error("Failed to save updates");
          }
      } catch (error) {
          alert("Erro ao salvar alterações");
          setEnrichmentStep('preview');
      }
  };

  // Maintenance Functions
  const handleDeleteNoImage = async () => {
    setIsProcessingBulk(true);
    try {
        // 1. Identify candidates (empty or null)
        let productsToDelete = products.filter((p: Product) => !p.image || p.image.trim() === "");
        
        // 2. Identify candidates with potential broken links (scan the rest)
        const productsWithImage = products.filter((p: Product) => p.image && p.image.trim() !== "");
        
        if (productsWithImage.length > 0) {
             const userConfirmed = confirm(`Existem ${productsWithImage.length} produtos com URL de imagem. Deseja verificar quais estão quebradas? (Isso pode levar alguns instantes)`);
             
             if (userConfirmed) {
                 const brokenImages: Product[] = [];
                 
                 // Process in chunks to avoid browser freeze/network saturation
                 const chunkSize = 20;
                 for (let i = 0; i < productsWithImage.length; i += chunkSize) {
                    const chunk = productsWithImage.slice(i, i + chunkSize);
                    const results = await Promise.all(chunk.map(async (p: Product) => {
                        const exists = await checkImageExists(p.image);
                        return exists ? null : p;
                    }));
                    
                    results.forEach((p: Product | null) => {
                        if (p) brokenImages.push(p);
                    });
                }
                 
                 productsToDelete = [...productsToDelete, ...brokenImages];
             }
        }
    
        if (productsToDelete.length === 0) {
            alert("Nenhum produto sem imagem ou com imagem quebrada encontrado.");
            return;
        }

        if (!confirm(`Encontrados ${productsToDelete.length} produtos inválidos (sem imagem ou link quebrado). Deseja excluí-los?`)) return;

        let deletedCount = 0;
        
        // Process in chunks
        const chunkSize = 5;
        for (let i = 0; i < productsToDelete.length; i += chunkSize) {
             const chunk = productsToDelete.slice(i, i + chunkSize);
             await Promise.all(chunk.map((p: Product) => fetch(`/api/products/${p.id}`, { method: "DELETE" })));
             deletedCount += chunk.length;
        }

        alert(`${deletedCount} produtos excluídos com sucesso.`);
        fetchProducts();
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir alguns produtos.");
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleDeleteDuplicates = async () => {
    const nameMap = new Map<string, Product[]>();
    
    // Group by normalized name
    products.forEach((p: Product) => {
        const normalizedName = p.name.trim().toLowerCase();
        if (!nameMap.has(normalizedName)) {
            nameMap.set(normalizedName, []);
        }
        nameMap.get(normalizedName)?.push(p);
    });

    const productsToDelete: Product[] = [];
    
    nameMap.forEach((group) => {
        if (group.length > 1) {
            // Sort to keep the best one: prefer one with image, then created_at (if available), or just first
            // We want to DELETE the others.
            // Sort: Products with image come first.
            group.sort((a, b) => {
                const aHasImage = a.image && a.image.trim() !== "";
                const bHasImage = b.image && b.image.trim() !== "";
                if (aHasImage && !bHasImage) return -1; // a comes first (keep)
                if (!aHasImage && bHasImage) return 1;  // b comes first (keep)
                return 0;
            });

            // Keep index 0, delete the rest
            for (let i = 1; i < group.length; i++) {
                productsToDelete.push(group[i]);
            }
        }
    });

    if (productsToDelete.length === 0) {
        alert("Nenhum produto duplicado encontrado.");
        return;
    }

    if (!confirm(`Encontrados ${productsToDelete.length} produtos duplicados (pelo nome). Deseja excluir as cópias e manter o original?`)) return;

    setIsProcessingBulk(true);
    let deletedCount = 0;
    
    try {
        // Process in chunks to avoid overwhelming the server
        const chunkSize = 5;
        for (let i = 0; i < productsToDelete.length; i += chunkSize) {
            const chunk = productsToDelete.slice(i, i + chunkSize);
            await Promise.all(chunk.map(p => fetch(`/api/products/${p.id}`, { method: "DELETE" })));
            deletedCount += chunk.length;
        }
        alert(`${deletedCount} produtos duplicados excluídos com sucesso.`);
        fetchProducts();
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir alguns produtos.");
    } finally {
        setIsProcessingBulk(false);
    }
  };

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredProducts.map((p: Product) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Bulk Actions
  const handleBulkUpdateCategory = async () => {
    if (!bulkCategory) return alert("Selecione uma categoria");
    if (!confirm(`Mover ${selectedIds.size} produtos para ${bulkCategory}?`)) return;

    setIsProcessingBulk(true);
    try {
        const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: Array.from(selectedIds),
                action: "update_category",
                value: bulkCategory
            })
        });

        if (res.ok) {
            alert("Categoria atualizada com sucesso!");
            setSelectedIds(new Set());
            fetchProducts();
        } else {
            throw new Error("Falha ao atualizar");
        }
    } catch (e) {
        alert("Erro ao atualizar em massa");
        console.error(e);
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (bulkPricePercent === 0) return alert("Digite uma porcentagem");
    if (!confirm(`Alterar preço de ${selectedIds.size} produtos em ${bulkPricePercent}%?`)) return;

    setIsProcessingBulk(true);
    try {
        const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: Array.from(selectedIds),
                action: "update_price",
                value: bulkPricePercent
            })
        });

        if (res.ok) {
            alert("Preços atualizados com sucesso!");
            setSelectedIds(new Set());
            setBulkPricePercent(0);
            fetchProducts();
        } else {
            throw new Error("Falha ao atualizar");
        }
    } catch (e) {
        alert("Erro ao atualizar em massa");
        console.error(e);
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} produtos selecionados? Esta ação não pode ser desfeita.`)) return;
    
    setIsProcessingBulk(true);
    let deletedCount = 0;
    
    try {
        const idsToDelete = Array.from(selectedIds);
        
        // Process in chunks to avoid overwhelming the server
        const chunkSize = 5;
        for (let i = 0; i < idsToDelete.length; i += chunkSize) {
            const chunk = idsToDelete.slice(i, i + chunkSize);
            await Promise.all(chunk.map(id => fetch(`/api/products/${id}`, { method: "DELETE" })));
            deletedCount += chunk.length;
        }
        
        alert(`${deletedCount} produtos excluídos com sucesso.`);
        setSelectedIds(new Set());
        fetchProducts();
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir alguns produtos.");
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setImagePreview(product.image);
    setImageFile(null);
    setVideoFile(null);
    setVideoPreview(product.video_url || "");
    setVideoError(null);
    setIsEditing(true);
  };

  const handleDuplicate = async (product: Product) => {
    if(!confirm("Duplicar este produto?")) return;
    
    const newProduct = {
        ...product,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        name: `${product.name} (Cópia)`,
        slug: `${product.slug}-copia-${Math.floor(Math.random() * 1000)}`
    };
    
    // Call create API
    try {
        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct)
        });
        if (res.ok) fetchProducts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        fetchProducts();
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!currentProduct.name) return alert("Nome é obrigatório");
    if (!currentProduct.price) return alert("Preço é obrigatório");
    if (!currentProduct.category) return alert("Categoria é obrigatória");

    setSaving(true);
    try {
        let imageUrl = currentProduct.image;
        let videoUrl = currentProduct.video_url;

        // Upload Image if changed
        if (imageFile) {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("bucket", "products");
            
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                imageUrl = data.url;
            } else {
                throw new Error("Erro no upload da imagem");
            }
        }

        if (!imageUrl) {
            setSaving(false);
            return alert("Imagem é obrigatória. Por favor, faça upload de uma imagem.");
        }

        if (videoFile) {
            setVideoUploading(true);
            const formDataVideo = new FormData();
            formDataVideo.append("file", videoFile);
            formDataVideo.append("bucket", "product-videos");

            const resVideo = await fetch("/api/upload", { method: "POST", body: formDataVideo });
            if (resVideo.ok) {
                const dataVideo = await resVideo.json();
                videoUrl = dataVideo.url;
            } else {
                setVideoUploading(false);
                throw new Error("Erro no upload do vídeo");
            }
            setVideoUploading(false);
        }

        // Format price if user entered plain number
        let formattedPrice = currentProduct.price;
        if (!currentProduct.price.includes("R$")) {
            const num = parseFloat(currentProduct.price.replace(",", "."));
            if (!isNaN(num)) {
                formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
            }
        }

        const productData = {
            ...currentProduct,
            price: formattedPrice,
            image: imageUrl,
            video_url: videoUrl,
        };

        let res;
        if (currentProduct.id) {
            // Update
             res = await fetch(`/api/products/${currentProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
        } else {
            // Create
            // Generate basic ID/Slug if missing (Required because DB id is TEXT with no default)
            if (!productData.id) productData.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            if (!productData.slug) productData.slug = productData.name?.toLowerCase().replace(/\s+/g, '-') || 'produto';
            
            res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Erro ao salvar produto");
        }

        setIsEditing(false);
        fetchProducts();
    } catch (e: any) {
        console.error(e);
        alert("Erro ao salvar: " + e.message);
    } finally {
        setSaving(false);
    }
  };

  const handleMigration = async () => {
    // 1. Filter candidates: Products with image that is NOT supabase
    const candidates = products.filter(p => p.image && !p.image.includes('supabase.co'));

    if (candidates.length === 0) {
        return alert("Todas as imagens já estão no Supabase (ou não possuem imagem).");
    }

    if (!confirm(`Deseja migrar ${candidates.length} imagens para o Supabase? Isso pode demorar.`)) return;

    setIsMigrating(true);
    setMigrationProgress({ total: candidates.length, current: 0, success: 0, error: 0 });
    setMigrationLogs([]);
    setShowMigration(true);

    // Extract IDs
    const ids = candidates.map(p => p.id);
    
    // Chunk processing handled by backend? 
    // The backend /api/products/migrate-images handles a list of IDs.
    // However, for UI progress, we might want to send chunks to backend so we can update progress bar.
    // If we send all 1000 IDs, the request might timeout.
    
    const chunkSize = 5; // Small chunk for better progress feedback
    let successCount = 0;
    let errorCount = 0;

    try {
        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunkIds = ids.slice(i, i + chunkSize);
            
            // Update Log
            setMigrationLogs(prev => [...prev, `Processando lote ${Math.floor(i/chunkSize) + 1}...`]);

            const res = await fetch("/api/products/migrate-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: chunkIds })
            });

            if (res.ok) {
                const data = await res.json();
                const results = data.results || [];
                
                // Count success/error
                const successes = results.filter((r: any) => r.status === 'success' || r.status === 'skipped').length;
                const errors = results.filter((r: any) => r.status === 'error').length;
                
                successCount += successes;
                errorCount += errors;

                // Log details
                results.forEach((r: any) => {
                    if (r.status === 'error') {
                        setMigrationLogs(prev => [...prev, `Erro (ID: ${r.id}): ${r.error}`]);
                    }
                });

            } else {
                setMigrationLogs(prev => [...prev, `Erro na requisição do lote.`]);
                errorCount += chunkIds.length;
            }

            // Update Progress
            setMigrationProgress({
                total: candidates.length,
                current: Math.min(i + chunkSize, candidates.length),
                success: successCount,
                error: errorCount
            });
        }
        
        setMigrationLogs(prev => [...prev, `Concluído! Sucesso: ${successCount}, Erros: ${errorCount}`]);
        alert(`Migração concluída!\nSucesso: ${successCount}\nErros: ${errorCount}`);
        fetchProducts(); // Refresh to see new URLs

    } catch (error: any) {
        console.error("Migration error:", error);
        setMigrationLogs(prev => [...prev, `Erro fatal: ${error.message}`]);
        alert("Erro durante a migração.");
    } finally {
        setIsMigrating(false);
    }
  };

  // Filter Products
  const filteredProducts = React.useMemo(() => {
    let result = products;

    // Filter by Category
    if (filterCategory) {
        result = result.filter(p => p.category === filterCategory);
    }

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase().trim();
        
        // Admin Search: Direct substring match for reliability
        // Searches in Name, Category, Supplier, and ID
        result = result.filter(p => {
            const name = p.name?.toLowerCase() || "";
            const category = p.category?.toLowerCase() || "";
            const supplier = p.supplier?.toLowerCase() || "";
            const id = p.id?.toLowerCase() || "";
            
            return name.includes(lowerTerm) || 
                   category.includes(lowerTerm) || 
                   supplier.includes(lowerTerm) ||
                   id.includes(lowerTerm);
        });
    }
    return result;
  }, [products, searchTerm, filterCategory]);

  return (
    <div>
        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="font-medium text-red-800 flex items-center gap-2">
                    <CheckSquare size={18} />
                    {selectedIds.size} selecionados
                </div>
                
                <div className="h-6 w-px bg-red-200 mx-2 hidden md:block"></div>

                {/* Bulk Category */}
                <div className="flex items-center gap-2">
                    <select 
                        value={bulkCategory}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBulkCategory(e.target.value)}
                        className="text-sm border-red-200 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                        <option value="">Alterar Categoria...</option>
                        {sortedCategories.map((item) => (
                            <option key={item.category.id} value={item.category.name}>
                                {Array(item.level).fill('\u00A0\u00A0').join('')}{item.category.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleBulkUpdateCategory}
                        disabled={!bulkCategory || isProcessingBulk}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        Aplicar
                    </button>
                </div>

                <div className="h-6 w-px bg-red-200 mx-2 hidden md:block"></div>

                {/* Bulk Price */}
                <div className="flex items-center gap-2">
                    <div className="relative w-32">
                        <input 
                            type="number" 
                            placeholder="0"
                            value={bulkPricePercent || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkPricePercent(Number(e.target.value))}
                            className="w-full text-sm border-red-200 rounded-md py-1.5 pl-2 pr-6 focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <span className="absolute right-2 top-1.5 text-red-500 text-xs font-bold">%</span>
                    </div>
                    <button 
                        onClick={handleBulkUpdatePrice}
                        disabled={!bulkPricePercent || isProcessingBulk}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        Aplicar
                    </button>
                </div>

                <div className="flex-1"></div>
                
                <button 
                    onClick={handleBulkDelete}
                    disabled={isProcessingBulk}
                    className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors mr-4"
                >
                    <Trash2 size={16} />
                    Excluir Selecionados
                </button>

                <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                >
                    Cancelar Seleção
                </button>
            </div>
        )}

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-4 w-full md:w-auto flex-1">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar produtos..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="relative w-full md:w-48">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                    >
                        <option value="">Todas Categorias</option>
                        {sortedCategories.map((item) => (
                            <option key={item.category.id} value={item.category.name}>
                                {Array(item.level).fill('\u00A0\u00A0').join('')}{item.category.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {/* Maintenance Buttons */}
                <button 
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    title="Migrar Imagens"
                >
                    <Upload size={18} />
                    <span className="hidden lg:inline">Migrar Imagens</span>
                </button>

                {selectedIds.size > 0 && (
                    <button
                        onClick={handleEnrichSelected}
                        className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm"
                        title="Enriquecer produtos selecionados com IA"
                    >
                        <Sparkles size={18} />
                        <span className="hidden md:inline">Enriquecer com IA ({selectedIds.size})</span>
                    </button>
                )}
                <button
                    onClick={handleDeleteNoImage}
                    className="bg-white text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 hover:text-red-600 border border-gray-300 transition-colors"
                    title="Apagar itens sem foto"
                >
                    <ImageOff size={18} />
                    <span className="hidden lg:inline">Sem Foto</span>
                </button>
                <button
                    onClick={handleDeleteDuplicates}
                    className="bg-white text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 hover:text-red-600 border border-gray-300 transition-colors"
                    title="Apagar itens repetidos"
                >
                    <Copy size={18} />
                    <span className="hidden lg:inline">Duplicados</span>
                </button>

                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

                <button 
                    onClick={() => {
                        setCurrentProduct({ category: "Hardware" }); // Default
                        setImagePreview("");
                        setImageFile(null);
                        setIsEditing(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 whitespace-nowrap"
                >
                    <Plus size={20} /> <span className="hidden sm:inline">Novo Produto</span>
                </button>
            </div>
        </div>

        {/* Migration Progress */}
        {showMigration && (
            <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Migração de Imagens</h3>
                    <button onClick={() => setShowMigration(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                    <span>Processando: {migrationProgress.current} / {migrationProgress.total}</span>
                    <span>Sucesso: {migrationProgress.success} | Erros: {migrationProgress.error}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${(migrationProgress.current / Math.max(migrationProgress.total, 1)) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md h-40 overflow-y-auto text-xs font-mono border">
                    {migrationLogs.length === 0 && <span className="text-gray-400">Aguardando início...</span>}
                    {migrationLogs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                </div>
            </div>
        )}

        {/* List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                        <th className="p-4 w-10">
                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>
                        </th>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Custo</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando produtos...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
                    ) : (
                        filteredProducts.map((product: Product) => (
                            <tr key={product.id} className={`hover:bg-gray-50 ${selectedIds.has(product.id) ? "bg-red-50" : ""}`}>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleSelect(product.id)}
                                        className="text-gray-400 hover:text-[#E60012]"
                                    >
                                        {selectedIds.has(product.id) ? <CheckSquare className="text-[#E60012]" size={20} /> : <Square size={20} />}
                                    </button>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.supplier || "Sem fornecedor"}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{product.category}</td>
                                <td className="p-4 font-medium text-green-600">{product.price}</td>
                                <td className="p-4 text-gray-500">{product.cost ? formatCurrency(product.cost) : "-"}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(product)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Editar"><Edit size={18} /></button>
                                        <button onClick={() => handleDuplicate(product)} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Duplicar"><Copy size={18} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* AI Enrichment Modal */}
        {showEnrichmentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center bg-purple-50">
                        <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                            <Sparkles size={24} />
                            Enriquecimento com IA
                        </h2>
                        {!['loading', 'complete'].includes(enrichmentStep) && (
                            <button onClick={() => setShowEnrichmentModal(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        )}
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {enrichmentStep === 'loading' && (
                            <div className="text-center py-10">
                                <BrainCircuit size={64} className="mx-auto text-purple-300 animate-pulse mb-6" />
                                <h3 className="text-xl font-medium mb-2">Analisando produtos...</h3>
                                <p className="text-gray-500 mb-8">Consultando base de conhecimento e gerando descrições.</p>
                                
                                <div className="max-w-md mx-auto">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progresso</span>
                                        <span>{enrichmentProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${enrichmentProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">
                                        Processados: {enrichmentPreviews.length} / {selectedIds.size}
                                    </p>
                                </div>
                            </div>
                        )}

                        {enrichmentStep === 'preview' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                                    Revise as alterações sugeridas abaixo antes de aplicar.
                                </div>
                                
                                {enrichmentPreviews.map((item, idx) => (
                                    <div key={idx} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                                            <span className="font-medium">{item.name}</span>
                                            {item.status === 'success' ? (
                                                <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full">SUCESSO</span>
                                            ) : (
                                                <span className="text-red-600 text-xs font-bold px-2 py-1 bg-red-100 rounded-full">ERRO</span>
                                            )}
                                        </div>
                                        
                                        {item.status === 'success' && (
                                            <div className="p-3 text-sm grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-500 mb-1">Especificações Novas</h4>
                                                    <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto max-h-40">
                                                        {JSON.stringify(item.new_specs, null, 2)}
                                                    </pre>
                                                    
                                                    {item.seo_title && (
                                                        <div className="mt-3">
                                                            <h4 className="font-semibold text-gray-500 mb-1">SEO Title</h4>
                                                            <div className="text-xs bg-gray-50 p-2 rounded border">{item.seo_title}</div>
                                                        </div>
                                                    )}
                                                    
                                                    {item.seo_description && (
                                                        <div className="mt-2">
                                                            <h4 className="font-semibold text-gray-500 mb-1">Meta Description</h4>
                                                            <div className="text-xs bg-gray-50 p-2 rounded border">{item.seo_description}</div>
                                                        </div>
                                                    )}

                                                    {item.json_ld && (
                                                        <div className="mt-2">
                                                            <h4 className="font-semibold text-gray-500 mb-1">JSON-LD (Schema)</h4>
                                                            <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto max-h-24">
                                                                {JSON.stringify(item.json_ld, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-500 mb-1">Descrição Nova (HTML)</h4>
                                                    <div className="text-xs bg-gray-50 p-2 rounded border h-64 overflow-y-auto">
                                                        <div dangerouslySetInnerHTML={{ __html: item.new_description }} />
                                                    </div>

                                                    {item.bullet_points && item.bullet_points.length > 0 && (
                                                        <div className="mt-3">
                                                            <h4 className="font-semibold text-gray-500 mb-1">Destaques</h4>
                                                            <ul className="list-disc list-inside text-xs text-gray-700 bg-gray-50 p-2 rounded border">
                                                                {item.bullet_points.map((bp, i) => <li key={i}>{bp}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {item.status === 'error' && (
                                            <div className="p-3 text-sm text-red-600">
                                                Erro: {item.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {enrichmentStep === 'complete' && (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckSquare size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Concluído!</h3>
                                <p className="text-gray-600">Os produtos foram atualizados com sucesso.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        {enrichmentStep === 'preview' && (
                            <>
                                <button 
                                    onClick={() => setShowEnrichmentModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmEnrichment}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Save size={18} /> Confirmar e Salvar
                                </button>
                            </>
                        )}
                        {enrichmentStep === 'complete' && (
                            <button 
                                onClick={() => setShowEnrichmentModal(false)}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                            >
                                Fechar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Modal */}
        {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold">{currentProduct.id ? "Editar Produto" : "Novo Produto"}</h2>
                        <button onClick={() => setIsEditing(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
                        {/* Left Column: Media */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer relative transition-colors"
                                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                                    onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                                        e.preventDefault();
                                        if (e.dataTransfer.files?.[0]) {
                                            const file = e.dataTransfer.files[0];
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                >
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img src={imagePreview} className="mx-auto h-64 object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                <p>Clique ou arraste para alterar</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-gray-400">
                                            <ImageIcon size={48} className="mx-auto mb-2" />
                                            <p>Arraste uma imagem ou clique para selecionar</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo do Produto</label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 ring-red-500">
                                        <Video size={20} className="text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="flex-1 outline-none text-sm" 
                                            placeholder="Link do vídeo (YouTube, Vimeo ou URL direta)"
                                            value={currentProduct.video_url || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value.trim();
                                                setCurrentProduct({ ...currentProduct, video_url: value });
                                                setVideoPreview(value);
                                                if (!value) {
                                                    setVideoError(null);
                                                    return;
                                                }
                                                const lower = value.toLowerCase();
                                                const isValid =
                                                    lower.startsWith("http://") ||
                                                    lower.startsWith("https://") ||
                                                    lower.includes("youtube.com") ||
                                                    lower.includes("youtu.be") ||
                                                    lower.includes("vimeo.com");
                                                setVideoError(isValid ? null : "Formato de link inválido. Use YouTube, Vimeo ou URL direta.");
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                                            <Upload size={14} className="text-gray-500" />
                                            <span>Ou enviar arquivo de vídeo (MP4, WebM, MOV)</span>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/quicktime"
                                                className="hidden"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (!file.type.startsWith("video/")) {
                                                        setVideoError("Arquivo inválido. Selecione um vídeo MP4, WebM ou MOV.");
                                                        setVideoFile(null);
                                                        setVideoPreview("");
                                                        return;
                                                    }
                                                    setVideoError(null);
                                                    setVideoFile(file);
                                                    setVideoPreview(URL.createObjectURL(file));
                                                }}
                                            />
                                        </label>
                                        {videoUploading && (
                                            <span className="text-[11px] text-gray-500">Enviando vídeo...</span>
                                        )}
                                    </div>
                                    {videoError && (
                                        <p className="text-xs text-red-600">{videoError}</p>
                                    )}
                                    {videoPreview && !videoError && (
                                        <div className="mt-2">
                                            <ProductVideo
                                                videoUrl={videoPreview}
                                                productName={currentProduct.name || "Prévia do produto"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-red-500 outline-none"
                                    value={currentProduct.name || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (Venda)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-red-500 outline-none"
                                        placeholder="R$ 0,00"
                                        value={currentProduct.price || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-red-500 outline-none"
                                        placeholder="0.00"
                                        value={currentProduct.cost || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentProduct({...currentProduct, cost: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-red-500 outline-none"
                                    value={currentProduct.category || ""}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentProduct({...currentProduct, category: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {sortedCategories.map(item => (
                                        <option key={item.category.id} value={item.category.name}>
                                            {Array(item.level).fill('\u00A0\u00A0').join('')}{item.category.name}
                                        </option>
                                    ))}
                                    {/* Fallback */}
                                    {!sortedCategories.length && (
                                        <>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Periféricos">Periféricos</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-red-500 outline-none"
                                    value={currentProduct.supplier || ""}
                                    onChange={e => setCurrentProduct({...currentProduct, supplier: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea 
                                    className="w-full border rounded-lg px-3 py-2 h-32 focus:ring-2 ring-red-500 outline-none resize-none"
                                    value={currentProduct.description || ""}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentProduct({...currentProduct, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? "Salvando..." : (
                                <>
                                    <Save size={18} /> Salvar Produto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
