import React from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip)">
          {/* Main beams */}
          <g opacity="0.6">
            <motion.path
              d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
              stroke="url(#gradient1)"
              strokeOpacity="1"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
              }}
            />
            <motion.path
              d="M-373 -197C-373 -197 -311.06 201.97 111.86 346.24C534.78 490.51 604.86 895.24 604.86 895.24"
              stroke="url(#gradient2)"
              strokeOpacity="1"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: 2,
              }}
            />
            <motion.path
              d="M-373 -197C-373 -197 -311.06 201.97 111.86 346.24C534.78 490.51 604.86 895.24 604.86 895.24"
              stroke="url(#gradient3)"
              strokeOpacity="1"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: 4,
              }}
            />
          </g>

          {/* Gradient definitions */}
          <defs>
            <linearGradient
              id="gradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="transparent" stopOpacity="0" />
              <stop stopColor="#6366f1" stopOpacity="1" />
              <stop offset="32.5%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient
              id="gradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="transparent" stopOpacity="0" />
              <stop stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="32.5%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient
              id="gradient3"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="transparent" stopOpacity="0" />
              <stop stopColor="#a855f7" stopOpacity="1" />
              <stop offset="32.5%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            
            <clipPath id="clip">
              <rect width="400" height="400" />
            </clipPath>
          </defs>
        </g>
      </svg>

      {/* Floating orbs */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-screen filter blur-xl opacity-70"
            style={{
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "#6366f1" : "#8b5cf6"
              } 0%, transparent 50%)`,
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
            }}
            animate={{
              x: [
                Math.random() * 400,
                Math.random() * 400,
                Math.random() * 400,
                Math.random() * 400,
              ],
              y: [
                Math.random() * 400,
                Math.random() * 400,
                Math.random() * 400,
                Math.random() * 400,
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";

BackgroundBeams.displayName = "BackgroundBeams";

export default BackgroundBeams;