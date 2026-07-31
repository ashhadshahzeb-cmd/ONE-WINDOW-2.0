"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import Image from "next/image";

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.2}>
      <MeshDistortMaterial
        color="#ffffff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
};

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-black flex flex-col items-center justify-start pt-32 overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 5]} intensity={1} />
          <AnimatedSphere />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6"
        >
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
            Digital Governance
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-2xl text-gray-300 font-light mb-10 max-w-3xl"
        >
          Experience KWSC's One Window Facility & Advanced HRMS. A seamless, paperless, and secure digital ecosystem.
        </motion.p>
        
        {/* Dashboard Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 150, rotateX: 45, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-5xl mt-12 mb-20 rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden"
          style={{ perspective: 1000 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
          <Image 
            src="/real_dashboard.png" 
            alt="KWSC Real Dashboard" 
            width={1200} 
            height={800} 
            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </div>
      
    </section>
  );
}
