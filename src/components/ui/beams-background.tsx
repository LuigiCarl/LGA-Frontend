import React from "react";
import { motion } from "framer-motion";

export const BeamsBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated SVG Beams */}
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Light mode gradients */}
          <linearGradient id="beam1-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <linearGradient id="beam2-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#6366F1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <linearGradient id="beam3-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#A855F7" stopOpacity="0.2" />
            <stop offset="80%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Dark mode gradients */}
          <linearGradient id="beam1-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#6366F1" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <linearGradient id="beam2-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#6366F1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <linearGradient id="beam3-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#A855F7" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#6366F1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Light mode beams */}
        <g className="dark:hidden" opacity="0.8">
          {/* Beam 1 */}
          <motion.path
            d="M-200 100 Q200 50 400 200 T800 150 L1400 200"
            stroke="url(#beam1-light)"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2
            }}
          />
          
          {/* Beam 2 */}
          <motion.path
            d="M-100 300 Q300 250 600 400 T1000 350 L1300 400"
            stroke="url(#beam2-light)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
              repeatDelay: 1
            }}
          />
          
          {/* Beam 3 */}
          <motion.path
            d="M-150 500 Q250 450 500 600 T900 550 L1200 600"
            stroke="url(#beam3-light)"
            strokeWidth="1"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
              repeatDelay: 3
            }}
          />
          
          {/* Additional crossing beam */}
          <motion.path
            d="M1400 100 Q1000 150 700 50 T300 100 L-100 50"
            stroke="url(#beam1-light)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.2, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
              repeatDelay: 2
            }}
          />
        </g>

        {/* Dark mode beams */}
        <g className="hidden dark:block" opacity="0.7">
          {/* Beam 1 */}
          <motion.path
            d="M-200 100 Q200 50 400 200 T800 150 L1400 200"
            stroke="url(#beam1-dark)"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2
            }}
          />
          
          {/* Beam 2 */}
          <motion.path
            d="M-100 300 Q300 250 600 400 T1000 350 L1300 400"
            stroke="url(#beam2-dark)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
              repeatDelay: 1
            }}
          />
          
          {/* Beam 3 */}
          <motion.path
            d="M-150 500 Q250 450 500 600 T900 550 L1200 600"
            stroke="url(#beam3-dark)"
            strokeWidth="1"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
              repeatDelay: 3
            }}
          />
          
          {/* Additional crossing beam */}
          <motion.path
            d="M1400 100 Q1000 150 700 50 T300 100 L-100 50"
            stroke="url(#beam1-dark)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
              repeatDelay: 2
            }}
          />
        </g>
      </svg>

      {/* Floating particles - theme adaptive */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full opacity-40 dark:opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(0.5px)'
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Ambient glow effects - theme adaptive */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-[#6366F1]/10 via-[#8B5CF6]/5 to-transparent dark:from-[#6366F1]/20 dark:via-[#8B5CF6]/10 dark:to-transparent rounded-full blur-3xl"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-[#8B5CF6]/10 via-[#A855F7]/5 to-transparent dark:from-[#8B5CF6]/20 dark:via-[#A855F7]/10 dark:to-transparent rounded-full blur-3xl"
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    </div>
  );
});

BeamsBackground.displayName = "BeamsBackground";