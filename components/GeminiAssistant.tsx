
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { getFoodRecommendation } from '../services/geminiService';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const data = await getFoodRecommendation(input);
      setResponse(data);
    } catch (e) {
      setResponse({ recommendation: 'يا عم النت فيه مشكلة، اطلب كبدة وخلاص!', joke: 'النت بطيء زي الدليفري بتاع المحلات التانية.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-8 z-50 bg-white text-black p-4 rounded-full shadow-2xl border-4 border-[#FAB520] flex items-center justify-center"
      >
        <Bot className="w-8 h-8" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="relative w-full max-w-md bg-[#111] border-2 border-[#FAB520] rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(250,181,32,0.3)]"
            >
              <div className="p-6 bg-[#FAB520] text-black flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bot className="w-7 h-7" />
                  <h3 className="font-black text-xl italic">يا عم AI</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full"><X /></button>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh] scrollbar-hide">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                  <p className="font-bold text-gray-300">نفسك في إيه النهاردة يا عم؟ قولي حالتك إيه وأنا هقولك تاكل إيه!</p>
                </div>

                {isLoading && (
                  <div className="flex items-center gap-3 text-[#FAB520] font-black italic animate-pulse">
                    <Loader2 className="animate-spin" /> بفكرلك في أكلة تروقك...
                  </div>
                )}

                {response && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                    <div className="bg-[#FAB520]/10 p-5 rounded-3xl border border-[#FAB520]/30 text-[#FAB520]">
                      <h4 className="font-black text-lg mb-2 flex items-center gap-2 text-white"><Sparkles className="w-5 h-5" /> نصيحتي ليك:</h4>
                      <p className="font-bold text-lg leading-relaxed">{response.recommendation}</p>
                    </div>
                    {response.joke && (
                      <div className="bg-white/5 p-4 rounded-2xl italic text-gray-400 text-sm">
                        " {response.joke} "
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="p-6 bg-black/50 border-t border-white/10 flex gap-3">
                <input 
                  placeholder="مثلاً: ميت من الجوع وعايز حاجة حراقة" 
                  className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#FAB520] text-sm"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                />
                <button onClick={handleAsk} className="bg-[#FAB520] text-black p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all"><Send className="w-6 h-6" /></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiAssistant;
