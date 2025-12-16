import { useNavigate } from 'react-router';
import { RefreshCw, AlertTriangle, Activity, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * ERROR 500 - "NEURAL COLLAPSE"
 * 
 * Concept: A critical system malfunction with cascading energy pulses
 * Visual Style: Deep reds and oranges with electric yellow accents, pulsing warning indicators,
 *               digital distortion effects, emergency alert aesthetic
 * Typography: Bold sans-serif for warnings, monospace for system messages
 * Motion: Rapid pulse animations, flickering effects, cascading alerts
 */

export function Error500() {
  const navigate = useNavigate();
  const [pulseCount, setPulseCount] = useState(0);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Simulate system error logs
  useEffect(() => {
    const logs = [
      '> CRITICAL: Core system malfunction detected',
      '> ERROR: Neural network connection lost',
      '> WARNING: Attempting automatic recovery...',
      '> STATUS: Diagnostics running...',
    ];
    
    logs.forEach((log, index) => {
      setTimeout(() => {
        setSystemLogs((prev) => [...prev, log]);
      }, index * 800);
    });
  }, []);

  // Pulse counter
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1A0A0A] via-[#0A0A0A] to-[#1A0A00] overflow-hidden flex items-center justify-center">
      {/* Animated Warning Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 59, 48, 0.3) 0px,
              transparent 1px,
              transparent 40px,
              rgba(255, 59, 48, 0.3) 41px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 59, 48, 0.3) 0px,
              transparent 1px,
              transparent 40px,
              rgba(255, 59, 48, 0.3) 41px
            )
          `,
        }}
      />

      {/* Pulsing Danger Zone */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-radial from-red-500/20 via-transparent to-transparent animate-pulse-danger"
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* Glitch Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-red-500/50 animate-glitch-line"
            style={{
              top: `${20 + i * 20}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Warning Icon with Pulse */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-red-500/30 animate-pulse" />
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 border-4 border-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded-full border-4 border-red-400 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
              <AlertTriangle className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-[80px] md:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 leading-none tracking-tight mb-4 animate-flicker">
            500
          </h1>
          <div className="flex items-center justify-center gap-3 text-red-400 font-mono text-sm uppercase tracking-wider">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="animate-pulse">CRITICAL SYSTEM ERROR</span>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Primary Message */}
        <div className="mb-6 space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            NEURAL NETWORK FAILURE
          </h2>
          <p className="text-red-400 font-semibold text-lg">
            Core systems experiencing critical malfunction
          </p>
        </div>

        {/* Secondary Message */}
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Our quantum processors detected an anomaly in the matrix. 
          <span className="text-yellow-400"> Emergency protocols are active.</span> 
          <br />
          We're working to restore stability.
        </p>

        {/* System Logs Terminal */}
        <div className="mb-10 mx-auto max-w-2xl">
          <div className="bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-lg p-6 text-left font-mono text-sm shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-2 mb-4 text-red-400 border-b border-red-500/30 pb-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-xs">SYSTEM_DIAGNOSTICS.log</span>
            </div>
            <div className="space-y-2 text-gray-300">
              {systemLogs.map((log, index) => (
                <div key={index} className="animate-fade-in opacity-0" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}>
                  <span className="text-red-400">[ERR_{String(pulseCount + index).padStart(4, '0')}]</span> {log}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 animate-pulse" />
                <span className="animate-pulse">System recovery in progress...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.location.reload()}
            className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
              Reinitialize System
            </span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="group px-8 py-4 border-2 border-red-500/50 text-red-400 font-bold rounded-lg transition-all duration-300 hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <span className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Emergency Exit
            </span>
          </button>
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5 backdrop-blur-sm max-w-2xl mx-auto">
          <p className="text-yellow-400 text-sm font-mono">
            <span className="text-yellow-300 font-bold">⚠️ SYSTEM ADMINISTRATORS:</span> If this error persists, contact support with error code: 
            <span className="text-white font-bold"> SRV-500-{Date.now().toString().slice(-6)}</span>
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes pulse-danger {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes glitch-line {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 0.5; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
          75% { opacity: 0.9; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-danger { animation: pulse-danger ease-in-out infinite; }
        .animate-glitch-line { animation: glitch-line 3s linear infinite; }
        .animate-flicker { animation: flicker 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
