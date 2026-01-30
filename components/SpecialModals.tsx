
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Sparkles, Truck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image: string;
  initialItems: { name: string; price: number }[];
  type: 'sandwiches' | 'trays' | 'sweets';
  globalTotal: number;
  subtotal: number;
  deliveryFee: number;
  persistentState: { 
    quantities: Record<string, number>; 
    hasSecretSauce?: boolean;
    breadChoices?: Record<string, 'baladi' | 'western'>;
  };
  onUpdateState: (newState: any) => void;
  onFinalSubmit: (userInfo: any) => void;
  fullOrderSummary: any[];
  updateGlobalQuantity: (name: string, category: string, delta: number) => void;
  removeGlobalItem: (name: string, category: string) => void;
}

const SpecialModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  image, 
  initialItems, 
  type,
  globalTotal,
  deliveryFee,
  persistentState,
  onUpdateState,
  onFinalSubmit
}) => {
  const handleUpdateQty = (name: string, delta: number) => {
    const newQty = Math.max(0, (persistentState.quantities[name] || 0) + delta);
    onUpdateState({
      ...persistentState,
      quantities: { ...persistentState.quantities, [name]: newQty }
    });
  };

  const handleBreadChoice = (name: string, choice: 'baladi' | 'western') => {
    onUpdateState({
      ...persistentState,
      breadChoices: {
        ...(persistentState.breadChoices || {}),
        [name]: choice
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
        
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full md:max-w-4xl h-[95dvh] md:h-auto md:max-h-[85vh] bg-[#0c0c0c] md:rounded-[3.5rem] border-t-4 md:border-2 border-[#FAB520] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(250,181,32,0.3)]"
        >
          {/* Header Area */}
          <div className="relative h-40 md:h-64 shrink-0">
            <img src={image} className="w-full h-full object-cover" alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent" />
            <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white backdrop-blur-md z-20"><X className="w-6 h-6" /></button>
            <div className="absolute bottom-6 right-8 z-10">
              <h2 className="text-2xl md:text-5xl font-black text-white drop-shadow-lg">{title}</h2>
            </div>
          </div>

          {/* Menu Items List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 space-y-6 scrollbar-hide">
            {type === 'sandwiches' && (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpdateState({...persistentState, hasSecretSauce: !persistentState.hasSecretSauce})}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${persistentState.hasSecretSauce ? 'bg-[#FAB520] border-black text-black' : 'bg-white/5 border-dashed border-[#FAB520]/20'}`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-5 h-5 ${persistentState.hasSecretSauce ? 'text-black' : 'text-[#FAB520]'}`} />
                  <div>
                    <h4 className="font-black text-lg">صوص أعجوبة السحري ✨</h4>
                    <p className="text-[10px] opacity-60">خلطة يا عم السرية للطلب كله (+10 ج.م)</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative ${persistentState.hasSecretSauce ? 'bg-black' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${persistentState.hasSecretSauce ? 'right-1 bg-[#FAB520]' : 'left-1 bg-gray-500'}`} />
                </div>
              </motion.div>
            )}

            <div className="space-y-5">
              {initialItems.map((item, i) => {
                const qty = persistentState.quantities[item.name] || 0;
                const bread = persistentState.breadChoices?.[item.name] || 'baladi';
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.name} 
                    className={`p-5 md:p-6 rounded-[2rem] border-2 transition-all ${qty > 0 ? 'bg-white/5 border-[#FAB520] shadow-xl' : 'bg-white/5 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-black mb-1">{item.name}</h3>
                        <p className="text-[#FAB520] font-black text-lg">{item.price} ج.م</p>
                      </div>
                      <div className="flex items-center gap-4 bg-black p-2 rounded-xl border border-white/10">
                        <button onClick={() => handleUpdateQty(item.name, -1)} className="text-[#FAB520] p-1.5 active:scale-125 transition-transform"><Minus className="w-5 h-5" /></button>
                        <span className="text-2xl font-black w-6 text-center">{qty}</span>
                        <button onClick={() => handleUpdateQty(item.name, 1)} className="text-[#FAB520] p-1.5 active:scale-125 transition-transform"><Plus className="w-5 h-5" /></button>
                      </div>
                    </div>
                    {type === 'sandwiches' && qty > 0 && item.name !== 'حواوشي يا عم' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                        <button onClick={() => handleBreadChoice(item.name, 'baladi')} className={`py-3 rounded-xl font-black text-base transition-all ${bread === 'baladi' ? 'bg-[#FAB520] text-black shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500'}`}>عيش بلدي 🥖</button>
                        <button onClick={() => handleBreadChoice(item.name, 'western')} className={`py-3 rounded-xl font-black text-base transition-all ${bread === 'western' ? 'bg-[#FAB520] text-black shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500'}`}>عيش فينو فرنساوي 🥯</button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer - Static at bottom */}
          <div className="p-6 md:p-10 bg-black/95 backdrop-blur-md border-t border-white/5 shrink-0 pb-10 md:pb-10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-5 mb-1">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-gray-500 font-bold text-base">إجمالي القسم:</span>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#FAB520] tracking-tight">{globalTotal} ج.م</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                    <Truck className="w-2.5 h-2.5" />
                    <span>يضاف {deliveryFee} ج.م مصاريف توصيل عند الطلب</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={onClose} className="flex-1 md:px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-lg hover:bg-white/10 transition-colors">تكملة الطلب</button>
                  <button 
                    onClick={() => onFinalSubmit({})} 
                    className="flex-1 md:px-10 py-4 bg-[#FAB520] text-black rounded-2xl font-black text-xl shadow-[0_15px_30px_rgba(250,181,32,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    تثبيت الأكلة
                  </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpecialModal;
