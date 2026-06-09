import { useState, useCallback, useRef } from 'react';
import { Upload, X, ImagePlus, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
};

export default function ImageDropZone({ images, onChange, max = 6 }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (uploading) return;
    setUploading(true);
    const urls: string[] = [];

    for (const file of files) {
      if (images.length + urls.length >= max) break;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('vehicle-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (!error) {
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }

    if (urls.length) onChange([...images, ...urls]);
    setUploading(false);
  }, [images, onChange, max, uploading]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) uploadFiles(files);
  }, [uploadFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const removeImage = (index: number) => {
    const url = images[index];
    // Try to remove from storage
    try {
      const path = url.split('/vehicle-images/').pop();
      if (path) supabase.storage.from('vehicle-images').remove([path]);
    } catch { /* ignore */ }
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragEnter = (index: number) => setDropIndex(index);
  const handleDragEnd = () => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      moveImage(dragIndex, dropIndex);
    } else {
      setDragIndex(null);
      setDropIndex(null);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        Photos ({images.length}/{max})
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) uploadFiles(files);
            e.target.value = '';
          }}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drag & drop images here, or <span className="text-red-500">browse</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB each</p>
          </div>
        )}
      </div>

      {/* Image previews with drag-to-reorder */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`relative group rounded-xl overflow-hidden border-2 aspect-square cursor-grab active:cursor-grabbing transition-all ${
                i === 0 ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200'
              } ${dragIndex === i ? 'opacity-40 scale-95' : ''} ${dropIndex === i && dragIndex !== i ? 'border-red-300 scale-105' : ''}`}
            >
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute top-1 left-1 flex items-center gap-0.5">
                <span className="bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {i === 0 ? 'Cover' : i + 1}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>
          ))}

          {/* Add more button if under max */}
          {images.length < max && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 flex items-center justify-center transition-colors group"
            >
              <ImagePlus className="w-6 h-6 text-gray-300 group-hover:text-red-400 transition-colors" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
