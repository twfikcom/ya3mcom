
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronRight, CheckCircle2, ListChecks, Plus, Minus, Trash2, Truck, Loader2 } from 'lucide-react';

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
  fullOrderSummary: { name: string; quantity: number; price: number; bread?: string; category: string }[];
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
  const [showSuccess, setShowSuccess] = useState(false);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <motion.div initial={{ scale: 0.8, rotateX: 20, opacity: 0 }} animate={{ scale: 1, rotateX: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative w-full max-w-2xl bg-[#080808] border-2 border-[#FAB520] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(250,181,32,0.4)]">
          {showSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="p-20 text-center space-y-8">
              <CheckCircle2 className="w-32 h-32 text-[#FAB520] mx-auto animate-pulse" />
              <h2 className="text-4xl font-black text-white">طلبك وصل عندنا يا عم!</h2>
              <p className="text-[#FAB520] text-xl font-black">الدليفري طار بالعجلة وهيكون عندك في لمح البصر</p>
            </motion.div>
          ) : (
            <>
              <div className="relative h-56 md:h-72">
                <img src={image} className="w-full h-full object-cover" alt={title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent" />
                <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-black/70 rounded-full text-white hover:bg-[#FAB520] hover:text-black transition-all"><X className="w-6 h-6" /></button>
                <div className="absolute bottom-6 right-10"><h2 className="text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">{title}</h2></div>
              </div>

              <div className="p-8 md:p-12 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  {initialItems.map((item) => {
                    const isBreadEligible = item.name.includes('كبدة') || item.name.includes('سجق');
                    const currentChoice = persistentState.breadChoices?.[item.name] || 'baladi';
                    return (
                      <div key={item.name} className="flex flex-col gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10 hover:border-[#FAB520]/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-black text-white">{item.name}</h3>
                            <p className="text-[#FAB520] font-black text-base">{item.price} ج.م</p>
                          </div>
                          <div className="flex items-center gap-6 bg-black/50 p-3 rounded-2xl border border-white/10">
                            <button onClick={() => handleUpdateQty(item.name, -1)} className="p-1 text-[#FAB520] hover:scale-125"><Minus className="w-6 h-6" /></button>
                            <span className="text-2xl font-black min-w-[1.5ch] text-center">{persistentState.quantities[item.name] || 0}</span>
                            <button onClick={() => handleUpdateQty(item.name, 1)} className="p-1 text-[#FAB520] hover:scale-125"><Plus className="w-6 h-6" /></button>
                          </div>
                        </div>
                        {isBreadEligible && (persistentState.quantities[item.name] || 0) > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex items-center gap-3 pt-2 border-t border-white/5 overflow-hidden">
                            <span className="text-xs font-bold text-gray-400">نوع العيش:</span>
                            <div className="flex bg-black/30 rounded-xl p-1 gap-1 flex-1">
                              <button onClick={() => handleBreadChoice(item.name, 'baladi')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${currentChoice === 'baladi' ? 'bg-[#FAB520] text-black' : 'text-gray-500 hover:text-white'}`}>عيش بلدي</button>
                              <button onClick={() => handleBreadChoice(item.name, 'western')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${currentChoice === 'western' ? 'bg-[#FAB520] text-black' : 'text-gray-500 hover:text-white'}`}>عيش غربي</button>
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
                    <input placeholder="اسمك بالكامل" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                    <input placeholder="رقم تليفونك" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none text-left" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                  </div>
                  <input placeholder="عنوانك بالتفصيل (عمارة، دور، شقة)" className="w-full bg-black border border-white/20 p-5 rounded-2xl text-white font-black text-base focus:border-[#FAB520] outline-none" value={userInfo.address} onChange={e => setUserInfo({...userInfo, address: e.target.value})} />
                  <button type="button" onClick={() => setShowSummaryOverlay(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 border border-dashed border-[#FAB520]/50 rounded-xl text-[#FAB520] font-black text-sm hover:bg-[#FAB520]/10 transition-all active:scale-95"><ListChecks className="w-5 h-5" />دوس هنا عشان تعرف تشوف طلبك</button>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <div className="flex flex-col gap-1 mb-8 px-4">
                    <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                       <span>الحساب: {subtotal} ج.م</span>
                       <span className="flex items-center gap-1"><Truck className="w-4 h-4" />توصيل: {deliveryFee} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-2xl font-black text-white">إجمالي الحساب:</span><span className="text-4xl font-black text-[#FAB520]">{globalTotal} ج.م</span></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-white font-black py-6 rounded-[2rem] text-lg hover:bg-white/10 active:scale-95 transition-all">لسه هطلب أنواع تاني</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-[#FAB520] text-black font-black py-6 rounded-[2rem] text-xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(250,181,32,0.6)] active:scale-95 transition-all shadow-xl disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
                      {isSubmitting ? 'جاري الإرسال...' : 'إتمام الطلب'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {showSummaryOverlay && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSummaryOverlay(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-sm bg-[#111] border-2 border-[#FAB520] rounded-[2rem] p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black text-[#FAB520]">ملخص طلبك يا عم</h3><button onClick={() => setShowSummaryOverlay(false)} className="text-white"><X className="w-5 h-5" /></button></div>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {fullOrderSummary.length === 0 ? (
                    <p className="text-center text-gray-500 font-bold py-6 text-sm">لسه مأختارتش حاجة يا عم!</p>
                  ) : (
                    <>
                      {fullOrderSummary.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-2.5 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-black text-white text-xs">{item.name}</p>
                              <p className="text-[9px] text-gray-500 font-bold">{item.price} ج.م {item.bread && ` - عيش ${item.bread === 'baladi' ? 'بلدي' : 'غربي'}`}</p>
                            </div>
                            <span className="font-black text-[#FAB520] text-xs">{item.quantity * item.price} ج.م</span>
                          </div>
                          <div className="flex items-center justify-end gap-3 pt-1">
                            <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-0.5 border border-white/5">
                              <button onClick={() => updateGlobalQuantity(item.name, item.category, -1)} className="p-1 text-[#FAB520]"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-[10px] font-black min-w-[1.5ch] text-center">{item.quantity}</span>
                              <button onClick={() => updateGlobalQuantity(item.name, item.category, 1)} className="p-1 text-[#FAB520]"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                            <button onClick={() => removeGlobalItem(item.name, item.category)} className="p-1 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <button onClick={() => setShowSummaryOverlay(false)} className="w-full mt-4 bg-[#FAB520] text-black font-black py-3 rounded-xl text-sm">تمام يا عم</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
export default SpecialModal;
