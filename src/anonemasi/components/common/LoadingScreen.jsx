import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#050505] transition-colors duration-300">
      {/* Background ambient light effects to match the landing page */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360, 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ 
            rotate: -360, 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      <div className="flex flex-col items-center">
        {/* Logo and Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              filter: ["drop-shadow(0 0 0px rgba(79, 70, 229, 0))", "drop-shadow(0 0 20px rgba(79, 70, 229, 0.4))", "drop-shadow(0 0 0px rgba(79, 70, 229, 0))"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20"
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold font-outfit tracking-tight text-[var(--text-primary)]"
          >
            Anonemasi
          </motion.h1>
        </motion.div>

        {/* Loading Indicator */}
        <div className="mt-12 w-48 h-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5,
            times: [0, 0.2, 0.8, 1]
          }}
          className="mt-4 text-xs font-medium text-[var(--text-secondary)] tracking-widest uppercase"
        >
          Initializing System
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
