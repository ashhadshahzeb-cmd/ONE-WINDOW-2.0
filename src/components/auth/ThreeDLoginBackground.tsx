import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.4 + Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#0ea5e9"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      {/* A solid core sphere for depth */}
      <Sphere args={[0.9, 32, 32]} scale={2.5}>
        <meshStandardMaterial
          color="#020617"
          roughness={0.1}
          metalness={1}
          opacity={0.8}
          transparent
        />
      </Sphere>
    </Float>
  );
}

function SceneControls() {
  useFrame((state) => {
    // Subtle camera movement based on mouse pointer
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.pointer.x * 2), 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.pointer.y * 2), 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

class WebGLErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("WebGL is not supported or failed to initialize:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-950 opacity-80 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ThreeDLoginBackground() {
  return (
    <div className="absolute inset-0 bg-slate-950 overflow-hidden pointer-events-none z-0">
      <WebGLErrorBoundary>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#38bdf8" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#818cf8" />
          <pointLight position={[0, 0, 0]} intensity={2} color="#0ea5e9" />
          
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <AnimatedSphere />
          <SceneControls />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
