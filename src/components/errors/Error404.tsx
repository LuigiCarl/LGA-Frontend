import { useNavigate } from 'react-router';
import { Home, ArrowLeft, Search, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * ERROR 404 - "VOID DRIFT"
 * 
 * Concept: A quantum void where the requested resource has phased out of existence
 * Visual Style: Deep space blacks with cyan/blue holographic accents, floating particles,
 *               subtle scan line effects, and a luminous error code display
 * Typography: Monospace for code, sans-serif for messaging, high contrast
 * Motion: Gentle particle drift, pulsing scan lines, smooth hover transitions
 */

export function Error404() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; speed: number }>>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.5 + Math.random() * 1.5,
    }));
    setParticles(newParticles);
  }, []);

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0B0F] overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.speed * 4}s`,
            animationDelay: `${particle.id * 0.1}s`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}

      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Holographic Error Code */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 blur-3xl bg-cyan-500/20 animate-pulse-slow" />
          <h1 
            className="relative text-[120px] md:text-[200px] font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-blue-500 to-cyan-600 leading-none tracking-tighter"
            style={{
              textShadow: '0 0 40px rgba(6, 182, 212, 0.5)',
            }}
          >
            404
          </h1>
          {/* Hexagonal frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <polygon
                points="50 1 95 25 95 75 50 99 5 75 5 25"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="0.5"
                opacity="0.4"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Primary Message */}
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold text-white">
            <span className="inline-block animate-glitch">LOCATION NOT FOUND</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-sm">
            <Zap className="w-4 h-4 animate-pulse" />
            <span>QUANTUM_VOID_DETECTED</span>
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* Secondary Message */}
        <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          The coordinates you requested have drifted beyond the known data matrix. 
          <span className="text-cyan-400"> Recalibrating navigation systems...</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return to Base
            </span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 font-semibold rounded-lg transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Previous Location
            </span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-gray-500 font-mono">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span>SYSTEM_STATUS: OPERATIONAL</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes scan {
          0% { top: -2px; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        .animate-float { animation: float linear infinite; }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-glitch { animation: glitch 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
