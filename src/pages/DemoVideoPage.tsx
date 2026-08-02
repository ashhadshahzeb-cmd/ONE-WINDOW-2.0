import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlayCircle, MonitorPlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DemoVideoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">KW&SC</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">One Window Facility</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="border-white/10 hover:bg-white/5 text-slate-300"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] -z-10"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <PlayCircle className="w-4 h-4" /> System Overview
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            See the Dashboard in Action
          </h2>
          <p className="text-slate-400 text-lg">
            Watch the complete demonstration of the Karachi Water & Sewerage Corporation's One Window Facility Enterprise Dashboard.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden relative group flex items-center justify-center"
        >
          {/* Replace this div with an actual <video> tag or iframe (YouTube/Vimeo) when the video is available */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <PlayCircle className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Video Presentation</h3>
            <p className="text-sm text-slate-500">Insert your dashboard video here</p>
          </div>
          
          {/* Example video tag integration (uncomment and add source):
          <video 
            className="w-full h-full object-cover"
            controls
            poster="/assets/video-thumbnail.jpg"
          >
            <source src="/assets/dashboard-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          */}
        </motion.div>
      </main>
    </div>
  );
}
