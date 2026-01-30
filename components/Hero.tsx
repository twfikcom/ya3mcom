
import React from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../constants';

const Hero: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-10 overflow-hidden">
      <motion.img 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' }}
        src={LOGO_URL} 
        alt="Ya3m Logo" 
        className="h-40 md:h-56 object-contain mb-8 drop-shadow-[0_0_30px_rgba(250,181,32,0.5)]"
      />
      
      <motion.h1 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-7xl font-black mb-6 leading-tight"
      >
        أسرع دليفري في <br/> <span className="text-[#FAB520]">مصر يا عم!</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-gray-400 font-bold max-w-2xl px-4"
      >
        كبدة، سجق، حواوشي، طواجن وحلويات.. <br/> 
        اختار اللي يريحك وإحنا نجيلك طايرين!
      </motion.p>
      
      {/* Small floating scooter */}
      <motion.div
        animate={{ x: [-100, 1000] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 text-5xl opacity-20 pointer-events-none"
      >
        🛵💨
      </motion.div>
    </div>
  );
};

export default Hero;
