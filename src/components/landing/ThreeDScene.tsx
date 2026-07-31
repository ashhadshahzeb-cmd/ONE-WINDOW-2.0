import React, { useEffect, useRef, useState } from 'react';

export default function ThreeDScene() {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={observerRef}
      className={`w-full h-full min-h-[400px] sm:min-h-[600px] flex items-center justify-center relative transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ perspective: '1500px' }}
    >
      {/* Outer Wrapper for 3D Transform and Float */}
      <div 
        className="relative w-[95%] sm:w-[90%] lg:w-full max-w-[800px] xl:max-w-[900px] aspect-video animate-float mx-auto lg:ml-auto lg:mr-0 xl:-right-4"
        style={{
          transform: 'rotateX(4deg) rotateY(-12deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth Slabs to create thickness illusion */}
        <div className="absolute inset-0 bg-[#334155] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#1e293b] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#0f172a] rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.6)]" style={{ transform: 'translateZ(-8px)' }}></div>

        {/* Main Browser Frame */}
        <div 
          className="absolute inset-0 bg-[#0f172a] rounded-xl border border-[#334155] overflow-hidden flex flex-col"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Browser Chrome (macOS Style) */}
          <div className="h-10 bg-gradient-to-b from-[#1e293b] to-[#0f172a] flex items-center px-4 border-b border-[#000000]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
            </div>
            <div className="mx-auto bg-[#000000] text-[#94a3b8] text-[11px] font-mono px-20 py-1 rounded-md shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-[#1e293b]">
              www.kwsc1window.com
            </div>
            <div className="w-16"></div> {/* Spacer for balance */}
          </div>

          {/* Uploaded Dashboard Video */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-black">
            <video 
              src="/dashboard-video.mp4" 
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-fill"
            />
          </div>

          {/* Glare Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-xl">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -rotate-45 animate-glare mix-blend-overlay"></div>
            {/* Soft inner glow to enhance glass/gloss effect */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(255,255,255,0.05)] border border-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(4deg) rotateY(-12deg); }
          50% { transform: translateY(-20px) rotateX(6deg) rotateY(-8deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes glare {
          0% { transform: translateX(-100%) rotate(-45deg); }
          50%, 100% { transform: translateX(100%) rotate(-45deg); }
        }
        .animate-glare {
          animation: glare 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
