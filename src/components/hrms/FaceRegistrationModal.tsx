import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, ScanFace, CheckCircle2 } from 'lucide-react';
import { extractFaceDescriptor } from '@/lib/faceApi';

interface FaceRegistrationModalProps {
  employee: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FaceRegistrationModal({ employee, onClose, onSuccess }: FaceRegistrationModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast({ title: 'Camera Error', description: 'Could not access the camera.', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const handleScanAndSave = async () => {
    if (!videoRef.current || !isCameraActive) return;
    
    setIsScanning(true);
    try {
      // Extract descriptor using our faceApi utility
      const descriptorArray = await extractFaceDescriptor(videoRef.current);
      
      // Save to Supabase
      const { error } = await supabase
        .from('hrms_employees')
        .update({ face_descriptor: JSON.stringify(descriptorArray) })
        .eq('id', employee.id);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: `Face successfully registered for ${employee.name}.` 
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast({ 
        title: 'Scan Failed', 
        description: error.message || 'Could not detect a clear face. Try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="text-primary w-5 h-5" /> 
            Register Face for {employee.name}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Position the employee's face clearly in the camera frame to register their biometric profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="relative w-full max-w-[300px] aspect-square rounded-full overflow-hidden border-4 border-white/10 bg-black shadow-2xl flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Scanning overlay effect */}
            {isScanning && (
              <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <div className="w-full h-1 bg-primary animate-scan absolute top-0" style={{ boxShadow: '0 0 10px #22c55e' }}></div>
                <ScanFace className="w-12 h-12 text-primary animate-pulse" />
              </div>
            )}
            {!isCameraActive && !isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white/30">
                <Camera className="w-12 h-12" />
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleScanAndSave} 
            disabled={!isCameraActive || isScanning}
            className="w-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            {isScanning ? 'Extracting Features...' : 'Scan & Save Face'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
