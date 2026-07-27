import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScanFace, Camera, ShieldAlert } from 'lucide-react';
import { extractFaceDescriptor, matchFaceDescriptors } from '@/lib/faceApi';

interface FaceVerificationModalProps {
  employeeName: string;
  savedDescriptorString: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FaceVerificationModal({ employeeName, savedDescriptorString, onClose, onSuccess }: FaceVerificationModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!savedDescriptorString) {
      toast({ 
        title: 'No Face Registered', 
        description: `${employeeName} does not have a face registered in the system. Please ask HR to register it first.`,
        variant: 'destructive'
      });
      onClose();
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [savedDescriptorString]);

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
      toast({ title: 'Camera Error', description: 'Could not access the camera for face verification.', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const handleVerify = async () => {
    if (!videoRef.current || !isCameraActive || !savedDescriptorString) return;
    
    setIsScanning(true);
    try {
      // 1. Get live face descriptor
      const liveDescriptor = await extractFaceDescriptor(videoRef.current);
      
      // 2. Parse saved descriptor
      const savedDescriptor = JSON.parse(savedDescriptorString) as number[];
      
      // 3. Match
      const { isMatch, distance } = matchFaceDescriptors(liveDescriptor, savedDescriptor);
      
      if (isMatch) {
        toast({ title: 'Face Verified', description: 'Identity confirmed successfully.' });
        stopCamera();
        onSuccess(); // Triggers the actual attendance save
      } else {
        toast({ 
          title: 'Face Mismatch', 
          description: `Identity verification failed! (Distance: ${distance.toFixed(2)})`, 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Scan Failed', 
        description: error.message || 'Make sure your face is clearly visible.', 
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
            Face Verification
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Verifying identity for <span className="font-bold text-white">{employeeName}</span>. Please look into the camera.
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
            onClick={handleVerify} 
            disabled={!isCameraActive || isScanning}
            className="w-full font-bold shadow-lg shadow-primary/20"
          >
            {isScanning ? 'Verifying...' : 'Verify & Mark Attendance'}
          </Button>
          
          <div className="text-xs text-white/40 flex items-center gap-1 justify-center mt-2">
            <ShieldAlert className="w-3 h-3" /> Anti-Spoofing & 1:1 Matching Active
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
