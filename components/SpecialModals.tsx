
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, ListChecks, Plus, Minus, Trash2, Truck, Loader2, Sparkles, Flame, Cookie } from 'lucide-react';

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
    extraCheese?: Record<string, boolean>;
    spicyPeppers?: Record<string, boolean>;
  };
  onUpdateState: (newState: any) => void;
  onFinalSubmit: (userInfo: any) => void;
  fullOrderSummary: { 
    name: string; 
    quantity: number; 
    price: number; 
    bread?: string; 
    category: string;
    extraCheese?: boolean;
    spicyPeppers?: boolean;
  }[];
  updateGlobalQuantity: (name: string, category: string, delta: number) => void;
  removeGlobalItem: (name: string, category: string) => void;
  isSubmitting?: boolean;
}

const SpecialModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  image, 
  initialItems, 
  type,
  globalTotal,
  subtotal,
  deliveryFee,
  persistentState,
  onUpdateState,
  onFinalSubmit,
  fullOrderSummary,
  updateGlobalQuantity,
  removeGlobalItem,
  isSubmitting = false
}) => {
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
  const [showSummaryOverlay, setShowSummaryOverlay] = useState(false);

  const handleUpdateQty = (name: string, delta: number) => {
    const newQty = Math.max(0, (persistentState.quantities[name] || 0) + delta);
    onUpdateState({
      ...persistentState,
      quantities: { ...persistentState.quantities, [name]: newQty }
    });
  };

  const handleSauceToggle = () => {
    onUpdateState({
      ...persistentState,
      hasSecretSauce: !persistentState.hasSecretSauce
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

  const handleToggleOption = (name: string, option: 'extraCheese' | 'spicyPeppers') => {
    onUpdateState({
      ...persistentState,
      [option]: {
        ...(persistentState[option] || {}),
        [name]: !persistentState[option]?.[name]
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.phone || !userInfo.address) {
      alert('يا عم لازم تكتب بياناتك عشان نجيلك!');
      return;
    }
    onFinalSubmit(userInfo);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
        />
        <motion.div 
          initial={{ y: '100%', opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: '100%', opacity: 0 }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-[#080808] border-t-4 md:border-2 border-[#FAB520] rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(250,181,32,0.4)] h-[94vh] md:h-auto md:max-h-[90vh] flex flex-col"
        >
          <div className="relative h-48 md:h-60 shrink-0">
            <img src={image} className="w-full h-full object-cover" alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent" />
            <button onClick={onClose} className="absolute top-4 left-4 p-3 bg-black/70 rounded-full text-white hover:bg-[#FAB520] hover:text-black transition-all active:scale-90"><X className="w-6 h-6" /></button>
            <div className="absolute bottom-4 right-8"><h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">{title}</h2></div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
            {/* Secret Sauce Section - Only for Sandwiches */}
            {type === 'sandwiches' && (
              <motion.div 
                onClick={handleSauceToggle}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${persistentState.hasSecretSauce ? 'bg-[#FAB520] border-black text-black' : 'bg-white/5 border-dashed border-[#FAB520]/30 text-white'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${persistentState.hasSecretSauce ? 'bg-black text-[#FAB520]' : 'bg-[#FAB520]/10 text-[#FAB520]'}`}>
                    <Sparkles className={`w-6 h-6 ${persistentState.hasSecretSauce ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">صوص أعجوبة السحري</h4>
                    <p className={`text-sm font-bold ${persistentState.hasSecretSauce ? 'text-black/70' : 'text-gray-500'}`}>خلطة يا عم السرية لكل الطلب (+10 ج.م)</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${persistentState.hasSecretSauce ? 'bg-black' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${persistentState.hasSecretSauce ? 'right-1 bg-[#FAB520]' : 'left-1 bg-gray-400'}`} />
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {initialItems.map((item) => {
                const isSandwich = type === 'sandwiches';
                const currentChoice = persistentState.breadChoices?.[item.name] || 'baladi';
                const qty = persistentState.quantities[item.name] || 0;
                const hasCheese = persistentState.extraCheese?.[item.name] || false;
                const hasPeppers = persistentState.spicyPeppers?.[item.name] || false;
                
                return (
                  <div key={item.name} className={`flex flex-col gap-4 p-5 rounded-[2rem] border transition-all ${qty > 0 ? 'bg-white/5 border-[#FAB520]' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black text-white">{item.name}</h3>
                        <p className="text-[#FAB520] font-black text-base">{item.price} ج.م</p>
                      </div>
                      <div className="flex items-center gap-4 bg-black/50 p-2 rounded-2xl border border-white/10 shadow-inner">
                        <button onClick={() => handleUpdateQty(item.name, -1)} className="p-2 text-[#FAB520] active:scale-150 transition-transform"><Minus className="w-6 h-6" /></button>
                        <span className="text-2xl font-black min-w-[1.2ch] text-center">{qty}</span>
                        <button onClick={() => handleUpdateQty(item.name, 1)} className="p-2 text-[#FAB520] active:scale-150 transition-transform"><Plus className="w-6 h-6" /></button>
                      </div>
                    </div>
                    
                    {isSandwich && qty > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-4 pt-3 border-t border-white/5 overflow-hidden">
                        {/* Bread Selection */}
                        <div className="flex bg-black/40 rounded-2xl p-1.5 gap-2">
                          <button 
                            onClick={() => handleBreadChoice(item.name, 'baladi')} 
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${currentChoice === 'baladi' ? 'bg-[#FAB520] text-black' : 'text-gray-500'}`}
                          >
                            {currentChoice === 'baladi' && <CheckCircle2 className="w-4 h-4" />}
                            عيش بلدي
                          </button>
                          <button 
                            onClick={() => handleBreadChoice(item.name, 'western')} 
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${currentChoice === 'western' ? 'bg-[#FAB520] text-black' : 'text-gray-500'}`}
                          >
                            {currentChoice === 'western' && <CheckCircle2 className="w-4 h-4" />}
                            عيش فينو
                          </button>
                        </div>

                        {/* Extras Selection */}
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleToggleOption(item.name, 'extraCheese')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-black ${hasCheese ? 'bg-[#FAB520]/20 border-[#FAB520] text-[#FAB520]' : 'bg-black/20 border-white/5 text-gray-500'}`}
                          >
                            <Cookie className={`w-4 h-4 ${hasCheese ? 'animate-bounce' : ''}`} />
                            جبنة زيادة (+5)
                          </button>
                          <button 
                            onClick={() => handleToggleOption(item.name, 'spicyPeppers')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-black ${hasPeppers ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/20 border-white/5 text-gray-500'}`}
                          >
                            <Flame className={`w-4 h-4 ${hasPeppers ? 'animate-pulse text-red-500' : ''}`} />
                            شطة زيادة (+3)
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
              <h4 className="text-xl font-black text-[#FAB520] text-center">بياناتك يا عم عشان نجيلك</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="اسمك" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                <input placeholder="رقم التليفون" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none text-left" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
              </div>
              <input placeholder="العنوان فين بالظبط" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none" value={userInfo.address} onChange={e => setUserInfo({...userInfo, address: e.target.value})} />
              <button type="button" onClick={() => setShowSummaryOverlay(true)} className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-dashed border-[#FAB520]/50 rounded-2xl text-[#FAB520] font-black text-sm"><ListChecks className="w-5 h-5" />راجع الطلب بالكامل</button>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-[#080808] border-t border-white/10 shrink-0 pb-12 md:pb-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-black text-white">الإجمالي:</span>
              <span className="text-3xl font-black text-[#FAB520]">{globalTotal} ج.م</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-white font-black py-5 rounded-[2rem] active:scale-95 transition-all">لسه هطلب</button>
              <button onClick={handleSubmit} disabled={isSubmitting || globalTotal === 0} className="flex-1 bg-[#FAB520] text-black font-black py-5 rounded-[2rem] text-xl flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-7 h-7" />}
                {isSubmitting ? 'جاري الإرسال...' : 'إتمام الطلب'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Global Summary Overlay */}
        <AnimatePresence>
          {showSummaryOverlay && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSummaryOverlay(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-[#111] border-2 border-[#FAB520] rounded-[2rem] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black text-[#FAB520]">سلتك المجمعة</h3><button onClick={() => setShowSummaryOverlay(false)} className="text-white"><X /></button></div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                  {fullOrderSummary.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="font-black text-white text-sm">{item.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] text-gray-500 font-bold">{item.quantity} × {item.price} ج.م</span>
                          {item.bread && <span className="text-[10px] bg-white/10 px-1 rounded text-white">عيش {item.bread === 'baladi' ? 'بلدي' : 'فينو'}</span>}
                          {item.extraCheese && <span className="text-[10px] bg-[#FAB520]/20 text-[#FAB520] px-1 rounded">+جبنة</span>}
                          {item.spicyPeppers && <span className="text-[10px] bg-red-500/20 text-red-500 px-1 rounded">+شطة</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateGlobalQuantity(item.name, item.category, -1)} className="p-1 text-[#FAB520]"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-black">{item.quantity}</span>
                        <button onClick={() => updateGlobalQuantity(item.name, item.category, 1)} className="p-1 text-[#FAB520]"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => removeGlobalItem(item.name, item.category)} className="p-1 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {persistentState.hasSecretSauce && (
                     <div className="flex justify-between items-center p-3 bg-[#FAB520]/10 rounded-2xl border border-[#FAB520]/30 text-[#FAB520] text-xs font-black">
                        <span>صوص أعجوبة السحري</span>
                        <span>10 ج.م</span>
                     </div>
                  )}
                </div>
                <button onClick={() => setShowSummaryOverlay(false)} className="w-full mt-6 bg-[#FAB520] text-black font-black py-4 rounded-xl active:scale-95 transition-all">تمام يا عم</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
export default SpecialModal;
