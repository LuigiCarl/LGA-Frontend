import { useNavigate } from 'react-router';
import { ShieldAlert, Lock, ArrowLeft, Home, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * ERROR 403 - "ACCESS DENIED"
 * 
 * Concept: A secure vault with biometric scanner aesthetic and encrypted barriers
 * Visual Style: Deep purples and magentas with electric pink accents, hexagonal patterns,
 *               security scan lines, encrypted data streams
 * Typography: Sharp, authoritative fonts with encrypted text effects
 * Motion: Scanning animations, lock mechanisms, barrier pulses
 */

export function Error403() {
  const navigate = useNavigate();
  const [scanProgress, setScanProgress] = useState(0);
  const [showDenied, setShowDenied] = useState(false);

  // Simulate security scan
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setShowDenied(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0A0014] via-[#1A0A28] to-[#0A0014] overflow-hidden flex items-center justify-center">
      {/* Hexagonal Pattern Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23A855F7' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated Security Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute left-0 right-0 h-40 bg-gradient-to-b from-purple-500/20 via-fuchsia-500/10 to-transparent animate-security-scan"
          style={{ top: `${(scanProgress / 100) * 100}%` }}
        />
      </div>

      {/* Radial Gradient Pulse */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent animate-pulse-subtle" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Security Shield Icon */}
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-purple-500/30 animate-pulse" />
          
          {/* Rotating Hexagonal Frame */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
              <polygon
                points="100,10 170,50 170,130 100,170 30,130 30,50"
                fill="none"
                stroke="url(#purpleGradient)"
                strokeWidth="2"
                opacity="0.5"
              />
              <polygon
                points="100,25 155,57.5 155,122.5 100,155 45,122.5 45,57.5"
                fill="none"
                stroke="url(#fuchsiaGradient)"
                strokeWidth="1"
                opacity="0.7"
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient id="fuchsiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Shield Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 blur-xl opacity-50" />
                <ShieldAlert className="relative w-20 h-20 text-fuchsia-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
              </div>
            </div>

            {/* Lock Icon */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Lock className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-[90px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            403
          </h1>
        </div>

        {/* Security Scan Progress */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2 text-sm font-mono text-purple-300">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 animate-pulse" />
                BIOMETRIC SCAN
              </span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300 relative"
                style={{ width: `${scanProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          
          {showDenied && (
            <div className="mt-4 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
              <p className="text-red-400 font-mono text-sm font-bold uppercase tracking-wide">
                ⛔ ACCESS DENIED - INSUFFICIENT PRIVILEGES
              </p>
            </div>
          )}
        </div>

        {/* Primary Message */}
        <div className="mb-6 space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            RESTRICTED ZONE
          </h2>
          <div className="flex items-center justify-center gap-2 text-purple-400 font-mono text-sm">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>SECURITY_LEVEL: CLASSIFIED</span>
            <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Secondary Message */}
        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Your access credentials are insufficient for this sector. 
          <span className="text-purple-400"> This area requires elevated permissions.</span>
          <br />
          If you believe this is an error, contact your system administrator.
        </p>

        {/* Encrypted Data Visualization */}
        <div className="mb-10 mx-auto max-w-2xl">
          <div className="bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 font-mono text-xs text-purple-300 overflow-hidden">
            <div className="opacity-50 space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                  {Array.from({ length: 60 }, () => 
                    Math.random() > 0.5 ? '█' : '▓'
                  ).join('')}
                </div>
              ))}
            </div>
            <p className="mt-4 text-fuchsia-400 text-center uppercase tracking-wider">
              [ENCRYPTED DATA STREAM]
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return to Authorized Zone
            </span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group px-8 py-4 border-2 border-purple-500/50 text-purple-400 font-bold rounded-lg transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Previous Location
            </span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-4 border border-purple-500/30 rounded-lg bg-purple-500/5 backdrop-blur-sm max-w-2xl mx-auto">
          <p className="text-purple-300 text-sm">
            <Lock className="w-4 h-4 inline mr-2" />
            <span className="font-bold">Security Notice:</span> This incident has been logged. 
            Unauthorized access attempts are monitored and reported.
          </p>
        </div>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-purple-500/50" />
      <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-purple-500/50" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-purple-500/50" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-purple-500/50" />

      {/* Custom Styles */}
      <style>{`
        @keyframes security-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-security-scan { animation: security-scan 5s linear infinite; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
