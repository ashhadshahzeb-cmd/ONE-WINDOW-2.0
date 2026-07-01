import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle2, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function MobileUpload() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.6 quality for small size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setCompressedImage(compressed);
    } catch (err) {
      console.error("Compression error:", err);
      toast.error("Failed to process image. Try another photo.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!compressedImage || !sessionId) {
      toast.error("Please select or capture a photo first.");
      return;
    }

    setIsUploading(true);
    try {
      const channelName = `mobile-upload-${sessionId}`;
      const channel = supabase.channel(channelName);
      
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send broadcast
          const response = await channel.send({
            type: 'broadcast',
            event: 'image-uploaded',
            payload: { image: compressedImage },
          });

          if (response === 'ok') {
            setIsSuccess(true);
            toast.success("Document photo uploaded successfully!");
            // Clean up channel
            supabase.removeChannel(channel);
          } else {
            throw new Error("Failed to send image data.");
          }
        } else if (status === 'CHANNEL_ERROR') {
          toast.error("Failed to connect to real-time sync channel.");
          setIsUploading(false);
        }
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image. Please try again.");
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-teal-500/30 text-center py-8">
          <CardContent className="space-y-6">
            <CheckCircle2 className="w-20 h-20 text-teal-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black tracking-tight">Upload Complete!</h2>
            <p className="text-zinc-400 text-sm">
              The document image has been sent to the system. You can close this browser tab now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-white/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-black tracking-tight text-teal-400">
            Document Mobile Upload
          </CardTitle>
          <p className="text-xs text-zinc-500">Capture or select a file photo to sync with the desktop system</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          
          {/* Photo Area */}
          <div className="relative border-2 border-dashed border-zinc-800 rounded-2xl h-64 flex items-center justify-center overflow-hidden bg-black/40">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center space-y-2 text-zinc-600">
                <ImageIcon className="w-12 h-12 mx-auto" />
                <span className="text-xs block font-bold uppercase tracking-wider">No Photo Selected</span>
              </div>
            )}
            
            {isCompressing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-xs font-bold text-teal-500">Processing Image...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                disabled={isCompressing || isUploading}
              />
              <div className="flex items-center justify-center gap-2 w-full h-12 bg-zinc-800 hover:bg-zinc-700/80 active:bg-zinc-700 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg border border-white/5">
                <Camera className="w-5 h-5" />
                Take Document Photo
              </div>
            </label>

            <Button
              onClick={handleUpload}
              disabled={!compressedImage || isCompressing || isUploading}
              className="w-full h-12 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-black font-black rounded-xl gap-2 shadow-lg shadow-teal-500/20"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Sync to System
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
