import { useNavigate } from 'react-router';
import { CloudOff, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * ERROR 502 - "GATEWAY SILENCE"
 * 
 * Concept: Communication breakdown between nodes in a distributed network
 * Visual Style: Cool blues and teals with signal wave patterns, connection nodes,
 *               network topology visualization, signal interference effects
 * Typography: Technical, network-inspired fonts with signal strength indicators
 * Motion: Pulse signals, failed connection attempts, wave interference patterns
 */

export function Error502() {
  const navigate = useNavigate();
  const [signalStrength, setSignalStrength] = useState(100);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; active: boolean }>>([]);

  // Generate network nodes
  useEffect(() => {
    const newNodes = Array.from({ length: 8 }, () => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      active: Math.random() > 0.5,
    }));
    setNodes(newNodes);
  }, []);

  // Simulate signal degradation
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength((prev) => {
        const newStrength = prev - 5;
        if (newStrength <= 0) {
          setTimeout(() => setRetryAttempt((r) => r + 1), 500);
          return 100;
        }
        return newStrength;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1419] to-[#0A1B2E] overflow-hidden flex items-center justify-center">
      {/* Network Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Network Nodes Visualization */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {/* Connection Lines */}
          {nodes.map((node, i) => 
            nodes.slice(i + 1).map((targetNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - targetNode.x, 2) + 
                Math.pow(node.y - targetNode.y, 2)
              );
              if (distance < 40) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke={node.active && targetNode.active ? '#38BDF8' : '#EF4444'}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                );
              }
              return null;
            })
          )}
          
          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={i}>
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="4"
                fill={node.active ? '#38BDF8' : '#EF4444'}
                className="animate-pulse"
              />
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="8"
                fill="none"
                stroke={node.active ? '#38BDF8' : '#EF4444'}
                strokeWidth="1"
                opacity="0.3"
                className="animate-ping"
                style={{ animationDuration: '2s', animationDelay: `${i * 0.2}s` }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Interference Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-2 border-sky-500/20 rounded-full animate-wave"
            style={{
              animationDelay: `${i * 0.7}s`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Connection Lost Icon */}
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-sky-500/20 animate-pulse" />
          
          {/* Orbiting Satellites */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 border-2 border-dashed border-sky-500/30 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 border-2 border-dashed border-teal-500/30 rounded-full animate-spin-reverse" />
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-teal-600 blur-xl opacity-50" />
                <CloudOff className="relative w-20 h-20 text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
              </div>
            </div>

            {/* Failed Connection Indicators */}
            <WifiOff className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 text-red-400 animate-pulse" />
            <WifiOff className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-8 h-8 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-[90px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-400 leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]">
            502
          </h1>
        </div>

        {/* Signal Strength Meter */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-sky-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 text-sm font-mono text-sky-300">
              <span className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                GATEWAY CONNECTION
              </span>
              <span className={signalStrength > 30 ? 'text-sky-400' : 'text-red-400'}>
                {signalStrength}%
              </span>
            </div>
            
            {/* Signal Bars */}
            <div className="flex gap-1 mb-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded transition-all duration-300 ${
                    i < signalStrength / 10
                      ? 'bg-gradient-to-t from-sky-500 to-teal-400'
                      : 'bg-gray-700'
                  }`}
                  style={{
                    opacity: i < signalStrength / 10 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Retry Attempt: {retryAttempt}</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                GATEWAY_OFFLINE
              </span>
            </div>
          </div>
        </div>

        {/* Primary Message */}
        <div className="mb-6 space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
            GATEWAY TIMEOUT
          </h2>
          <div className="flex items-center justify-center gap-2 text-sky-400 font-mono text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>UPSTREAM_SERVER_UNREACHABLE</span>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Secondary Message */}
        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          The gateway between our servers has lost connection. 
          <span className="text-sky-400"> Communication nodes are attempting to re-establish link.</span>
          <br />
          This is usually temporary. Please try again in a moment.
        </p>

        {/* Network Status Terminal */}
        <div className="mb-10 mx-auto max-w-2xl">
          <div className="bg-black/60 backdrop-blur-sm border border-sky-500/30 rounded-lg p-6 text-left font-mono text-sm">
            <div className="flex items-center gap-2 mb-4 text-sky-400 border-b border-sky-500/30 pb-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-gray-600" />
              </div>
              <span className="text-xs">NETWORK_STATUS.log</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-red-400">[ERROR]</span>
                <span>Gateway connection timeout after 30s</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">[WARN]</span>
                <span>Upstream server not responding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-400">[INFO]</span>
                <span>Initiating automatic retry sequence...</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400">Attempting reconnection...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.location.reload()}
            className="group relative px-8 py-4 bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
              Retry Connection
            </span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="group px-8 py-4 border-2 border-sky-500/50 text-sky-400 font-bold rounded-lg transition-all duration-300 hover:border-sky-400 hover:bg-sky-500/10 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <span className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return Home
            </span>
          </button>
        </div>

        {/* Technical Info */}
        <div className="mt-12 p-4 border border-sky-500/30 rounded-lg bg-sky-500/5 backdrop-blur-sm max-w-2xl mx-auto">
          <p className="text-sky-300 text-sm font-mono">
            <CloudOff className="w-4 h-4 inline mr-2" />
            <span className="font-bold">Technical Details:</span> The gateway server failed to respond within the allocated time window. 
            Error Code: <span className="text-white font-bold">GW-502-TIMEOUT</span>
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes wave {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-wave { animation: wave 3s ease-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
      `}</style>
    </div>
  );
}
