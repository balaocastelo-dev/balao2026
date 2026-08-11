"use client";

import { useState, useEffect } from "react";
import { CarouselImage } from "@/lib/utils";
import { Trash2, Eye, EyeOff, GripVertical, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableItem({ image, onDelete, onToggle }: { image: CarouselImage; onDelete: (id: string) => void; onToggle: (img: CarouselImage) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm ${!image.active ? 'opacity-60 bg-gray-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600 text-gray-400">
        <GripVertical size={20} />
      </div>
      
      <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.image_url}
          alt={image.title || "Carousel"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-800">{image.title || "Sem título"}</p>
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{image.image_url}</p>
        {image.metadata && (
             <p className="text-xs text-gray-500 mt-1">
                {image.metadata.width}x{image.metadata.height} • {image.metadata.format}
             </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(image)}
          className={`p-2 rounded-full hover:bg-gray-100 ${image.active ? 'text-green-600' : 'text-gray-400'}`}
          title={image.active ? "Ocultar" : "Mostrar"}
        >
          {image.active ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
        <button
          onClick={() => onDelete(image.id)}
          className="p-2 rounded-full hover:bg-red-50 text-red-500"
          title="Remover"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setValidationError("");
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
        setValidationError("Apenas arquivos de imagem são permitidos.");
        setUploading(false);
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', newImageTitle || file.name.split('.')[0]);

        const res = await fetch("/api/carousel/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Erro no upload");
        }

        setNewImageUrl("");
        setNewImageTitle("");
        fetchImages();
    } catch (error: any) {
        console.error("Upload failed", error);
        setValidationError(error.message || "Falha ao enviar imagem.");
    } finally {
        setUploading(false);
    }
  };


  const fetchImages = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/carousel", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Ensure sorted by display_order
        const sorted = data.sort((a: CarouselImage, b: CarouselImage) => a.display_order - b.display_order);
        setImages(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch images", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const validateImage = (url: string): Promise<{ width: number; height: number; format: string }> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
              // Basic validation: ensure it's not tiny
              if (img.width < 100 || img.height < 100) {
                  reject("Imagem muito pequena. Use alta resolução.");
                  return;
              }
              resolve({
                  width: img.width,
                  height: img.height,
                  format: url.split('.').pop()?.toUpperCase() || 'UNKNOWN'
              });
          };
          img.onerror = () => reject("Não foi possível carregar a imagem. Verifique a URL.");
          img.src = url;
      });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update display_order
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          display_order: index
        }));

        // Save order
        fetch("/api/carousel/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: updatedItems.map(i => ({ id: i.id, display_order: i.display_order })) })
        }).catch(err => console.error("Failed to save order", err));

        return updatedItems;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta imagem?")) return;
    try {
      const res = await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        fetchImages({ silent: true });
      } else {
          console.error("Failed to delete");
      }
    } catch (error) {
      console.error("Failed to delete image", error);
    }
  };

  const handleToggleActive = async (image: CarouselImage) => {
    try {
      const updatedImage = { ...image, active: !image.active };
      const res = await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedImage),
      });

      if (res.ok) {
        setImages((prev) => prev.map((img) => (img.id === image.id ? updatedImage : img)));
        fetchImages({ silent: true });
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const handleAdd = async () => {
    if (!newImageUrl) return;
    setValidationError("");
    setAdding(true);
    
    try {
      // Validate image before adding
      const metadata = await validateImage(newImageUrl);
      
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            imageUrl: newImageUrl, 
            title: newImageTitle,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                device_origin: "web_import"
            }
        }),
      });
      if (res.ok) {
        setNewImageUrl("");
        setNewImageTitle("");
        fetchImages();
      }
    } catch (error: any) {
      console.error("Failed to add image", error);
      setValidationError(typeof error === 'string' ? error : "Erro ao validar/adicionar imagem.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className={`bg-white p-6 rounded-lg shadow-sm border-2 border-dashed transition-colors ${
            dragActive ? "border-[#E60012] bg-red-50" : "border-gray-200"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">Adicionar Nova Imagem</h2>
        
        <div className="flex flex-col gap-4">
           {/* Drag and Drop Area */}
           <div className="flex flex-col items-center justify-center py-8 text-center">
                <ImageIcon size={48} className={`mb-4 ${dragActive ? "text-[#E60012]" : "text-gray-300"}`} />
                <p className="text-sm text-gray-500 mb-2">
                    Arraste e solte uma imagem aqui ou
                </p>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                    Selecionar Arquivo
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
                {uploading && <p className="text-xs text-[#E60012] mt-2 animate-pulse">Enviando imagem...</p>}
           </div>

           <div className="relative flex items-center gap-4 py-2">
               <div className="flex-grow border-t border-gray-200"></div>
               <span className="flex-shrink-0 text-gray-400 text-xs uppercase">Ou use uma URL</span>
               <div className="flex-grow border-t border-gray-200"></div>
           </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="URL da imagem (https://...)"
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E60012]"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Título (opcional)"
              className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E60012]"
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newImageUrl}
              className="bg-[#E60012] text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
          
          {validationError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                  <AlertCircle size={16} />
                  {validationError}
              </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map(img => img.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {loading ? (
                <p className="text-center text-gray-500 py-8">Carregando imagens...</p>
            ) : images.length === 0 ? (
                <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Nenhuma imagem no carrossel. Adicione uma acima.
                </p>
            ) : (
                images.map((image) => (
                <SortableItem 
                    key={image.id} 
                    image={image} 
                    onDelete={handleDelete}
                    onToggle={handleToggleActive}
                />
                ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
