
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import SpecialModal from './components/SpecialModals';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Plus, Minus, Truck } from 'lucide-react';

const DELIVERY_FEE = 20;

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'sandwiches' | 'trays' | 'sweets' | null>(null);
  const [isGlobalSummaryOpen, setIsGlobalSummaryOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [sandwichState, setSandwichState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])),
    hasSecretSauce: false,
    breadChoices: { 'كبدة إسكندراني': 'baladi', 'سجق بلدي': 'baladi' }
  });
  
  const [trayState, setTrayState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0]))
  });
  
  const [sweetState, setSweetState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0]))
  });

  // Ensure state matches constants if they change
  useEffect(() => {
    setTrayState(prev => ({
      ...prev,
      quantities: {
        ...Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0])),
        ...prev.quantities
      }
    }));
    setSweetState(prev => ({
      ...prev,
      quantities: {
        ...Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0])),
        ...prev.quantities
      }
    }));
  }, []);

  const updateGlobalQuantity = (name: string, category: string, delta: number) => {
    const update = (prev: SpecialOrderState) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [name]: Math.max(0, (prev.quantities[name] || 0) + delta)
      }
    });

    if (category === 'sandwiches') setSandwichState(update);
    else if (category === 'trays') setTrayState(update);
    else if (category === 'sweets') setSweetState(update);
  };

  const removeGlobalItem = (name: string, category: string) => {
    const reset = (prev: SpecialOrderState) => ({
      ...prev,
      quantities: { ...prev.quantities, [name]: 0 }
    });

    if (category === 'sandwiches') setSandwichState(reset);
    else if (category === 'trays') setTrayState(reset);
    else if (category === 'sweets') setSweetState(reset);
  };

  const subtotal = useMemo(() => {
    const calc = (state: SpecialOrderState, items: {name: string, price: number}[]) => {
      let sum = items.reduce((acc, item) => acc + (item.price * (state.quantities[item.name] || 0)), 0);
      if (state.hasSecretSauce) sum += 10;
      return sum;
    };
    return calc(sandwichState, SANDWICH_ITEMS) + calc(trayState, TRAY_ITEMS) + calc(sweetState, SWEET_ITEMS);
  }, [sandwichState, trayState, sweetState]);

  const globalTotal = useMemo(() => {
    return subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
  }, [subtotal]);

  const totalItemCount = useMemo(() => {
    const allQtys = [...Object.values(sandwichState.quantities), ...Object.values(trayState.quantities), ...Object.values(sweetState.quantities)] as number[];
    return allQtys.reduce((a, b) => a + b, 0);
  }, [sandwichState, trayState, sweetState]);

  const fullOrderSummary = useMemo(() => {
    const summary: { name: string; quantity: number; price: number; bread?: string; category: string }[] = [];
    SANDWICH_ITEMS.forEach(item => {
      const q = sandwichState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, bread: sandwichState.breadChoices?.[item.name], category: 'sandwiches' });
    });
    TRAY_ITEMS.forEach(item => {
      const q = trayState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, category: 'trays' });
    });
    SWEET_ITEMS.forEach(item => {
      const q = sweetState.quantities[item.name] || 0;
      if (q > 0) summary.push({ name: item.name, quantity: q, price: item.price, category: 'sweets' });
    });
    return summary;
  }, [sandwichState, trayState, sweetState]);

  const handleFinalSubmit = (info: any) => {
    if (!info.name || !info.phone || !info.address) {
      alert('يا عم لازم تكتب بياناتك عشان نجيلك!');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsGlobalSummaryOpen(false);
      setSandwichState({ quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])), hasSecretSauce: false, breadChoices: { 'كبدة إسكندراني': 'baladi', 'سجق بلدي': 'baladi' } });
      setTrayState({ quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0])) });
      setSweetState({ quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0])) });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Cairo'] relative pb-32">
      <main className="max-w-7xl mx-auto px-4 pt-10">
        <Hero />
        <section className="mt-12">
          <h2 className="text-2xl font-black text-center mb-12 text-[#FAB520]">اختار القسم اللي تحبه يا عم</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05, y: -10 }} onClick={() => setActiveModal('sandwiches')} className="cursor-pointer bg-[#FAB520] p-8 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6 group relative overflow-hidden">
              <Sandwich className="w-24 h-24 text-black group-hover:rotate-12 transition-transform" />
              <div><h3 className="text-2xl font-black text-black">ركن السندوتشات</h3><p className="text-black/60 font-bold mt-2">كبدة وسجق وحواوشي نار</p></div>
              <div className="bg-black text-white px-8 py-3 rounded-2xl font-black text-lg">دخول المتجر</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -10 }} onClick={() => setActiveModal('trays')} className="cursor-pointer bg-white/5 border-4 border-[#FAB520] p-8 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6 group relative overflow-hidden">
              <div className="absolute top-6 left-6 bg-[#FAB520] text-black font-black px-4 py-1 rounded-full text-[10px] shadow-lg transform -rotate-12">لحم بلدي 100%</div>
              <Utensils className="w-24 h-24 text-[#FAB520] group-hover:rotate-12 transition-transform" />
              <div><h3 className="text-2xl font-black text-[#FAB520]">صواني وطواجن</h3><p className="text-white/40 font-bold mt-2">أكل بيتي يرم العضم بلحم بلدي</p></div>
              <div className="bg-[#FAB520] text-black px-8 py-3 rounded-2xl font-black text-lg">دخول المتجر</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -10 }} onClick={() => setActiveModal('sweets')} className="cursor-pointer bg-white/10 p-8 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6 group relative overflow-hidden">
              <IceCream className="w-24 h-24 text-white group-hover:rotate-12 transition-transform" />
              <div><h3 className="text-2xl font-black text-white">حلويات يا عم</h3><p className="text-white/40 font-bold mt-2">عشان تحلي بعد الأكلة</p></div>
              <div className="bg-white/10 text-white px-8 py-3 rounded-2xl font-black text-lg">دخول المتجر</div>
            </motion.div>
          </div>
        </section>
        <section className="mt-24 bg-[#FAB520] text-black rounded-[3rem] p-12 text-center mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div><p className="text-4xl font-black">+10,000</p><p className="text-lg font-bold opacity-70">أكيل راضي</p></div>
            <div><p className="text-4xl font-black">25 دقيقة</p><p className="text-lg font-bold opacity-70">سرعة دليفري خرافية</p></div>
            <div><p className="text-4xl font-black">طازة 100%</p><p className="text-lg font-bold opacity-70">جودة يا عم المعهودة</p></div>
          </div>
        </section>
      </main>

      <motion.button initial={{ scale: 0, y: 100 }} animate={{ scale: 1, y: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsGlobalSummaryOpen(true)} className="fixed bottom-10 left-10 z-[60] bg-[#FAB520] text-black p-6 rounded-full shadow-[0_15px_50px_rgba(250,181,32,0.4)] flex items-center gap-4 border-4 border-black">
        <div className="relative">
          <ShoppingBasket className="w-12 h-12" />
          {totalItemCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-[#FAB520] text-lg font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#FAB520]">{totalItemCount}</span>}
        </div>
        <span className="text-xl font-black hidden sm:inline">سلة طلباتك يا عم</span>
      </motion.button>

      <AnimatePresence>
        {isGlobalSummaryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGlobalSummaryOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} className="relative w-full max-w-xl bg-[#080808] border-r-4 border-[#FAB520] h-[90vh] md:h-screen md:fixed md:top-0 md:right-0 rounded-t-[3rem] md:rounded-none overflow-hidden flex flex-col">
              {showSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#FAB520] p-10 rounded-full"><Send className="w-20 h-20 text-black" /></motion.div>
                  <h2 className="text-4xl font-black">تم الإرسال يا عم!</h2>
                  <p className="text-xl text-gray-400">طلبك بيتحضر وهيكون عندك في أقل من 25 دقيقة</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3"><ShoppingBasket className="w-8 h-8 text-[#FAB520]" /><h2 className="text-xl font-black">راجع طلبك قبل ما نبعت</h2></div>
                    <button onClick={() => setIsGlobalSummaryOpen(false)} className="p-2 bg-white/5 rounded-full text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {fullOrderSummary.length === 0 ? (
                      <div className="text-center py-20 space-y-6"><ShoppingBasket className="w-20 h-20 text-white/10 mx-auto" /><p className="text-lg font-black text-gray-500">السلة لسه مفيهاش حاجة يا عم!</p><button onClick={() => setIsGlobalSummaryOpen(false)} className="bg-[#FAB520] text-black font-black px-8 py-3 rounded-2xl text-lg">روح اطلب</button></div>
                    ) : (
                      <>
                        {fullOrderSummary.map((item, idx) => (
                          <motion.div layout key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border border-white/10">
                            <div className="flex-1">
                              <h4 className="text-base font-black">{item.name}</h4>
                              <p className="text-[#FAB520] font-bold text-sm">{item.quantity} × {item.price} ج.م {item.bread && ` (عيش ${item.bread === 'baladi' ? 'بلدي' : 'غربي'})`}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-black/50 p-1 rounded-xl border border-white/5">
                                <button onClick={() => updateGlobalQuantity(item.name, item.category, -1)} className="p-1.5 text-[#FAB520] hover:scale-110"><Minus className="w-4 h-4" /></button>
                                <span className="text-lg font-black min-w-[1.5ch] text-center">{item.quantity}</span>
                                <button onClick={() => updateGlobalQuantity(item.name, item.category, 1)} className="p-1.5 text-[#FAB520] hover:scale-110"><Plus className="w-4 h-4" /></button>
                              </div>
                              <button onClick={() => removeGlobalItem(item.name, item.category)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </motion.div>
                        ))}
                        <div className="p-4 bg-white/5 rounded-[1.5rem] border border-dashed border-white/20 flex justify-between items-center text-gray-400">
                          <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#FAB520]" />
                            <span className="text-lg font-black">خدمة التوصيل</span>
                          </div>
                          <span className="text-lg font-black">{DELIVERY_FEE} ج.م</span>
                        </div>
                      </>
                    )}
                    {sandwichState.hasSecretSauce && (
                      <div className="p-4 bg-[#FAB520]/10 rounded-[1.5rem] border border-[#FAB520]/30 flex justify-between items-center">
                        <span className="text-lg font-black text-[#FAB520]">صوص أعجوبة السري ✨</span>
                        <span className="text-lg font-black text-[#FAB520]">10 ج.م</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="text-base font-bold">الحساب:</span>
                        <span className="text-lg font-bold">{subtotal} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black">الإجمالي (شامل التوصيل):</span>
                        <span className="text-3xl font-black text-[#FAB520]">{globalTotal} ج.م</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                       <input placeholder="اسمك بالكامل يا عم" className="w-full bg-black border border-white/20 p-4 rounded-xl text-white font-black text-sm focus:border-[#FAB520] outline-none" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                       <input placeholder="رقم تليفونك" className="w-full bg-black border border-white/20 p-4 rounded-xl text-white font-black text-sm focus:border-[#FAB520] outline-none" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                       <input placeholder="عنوانك فين بالضبط" className="w-full bg-black border border-white/20 p-4 rounded-xl text-white font-black text-sm focus:border-[#FAB520] outline-none" value={userInfo.address} onChange={e => setUserInfo({...userInfo, address: e.target.value})} />
                    </div>
                    <button onClick={() => handleFinalSubmit(userInfo)} disabled={fullOrderSummary.length === 0} className="w-full bg-[#FAB520] text-black font-black py-5 rounded-[1.5rem] text-lg flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(250,181,32,0.3)] disabled:opacity-50"><Send className="w-7 h-7" />إتمام الطلب الآن</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SpecialModal 
        isOpen={activeModal === 'sandwiches'} onClose={() => setActiveModal(null)} title="ركن السندوتشات" 
        image="https://sayedsamkary.com/unnamed.jpg"
        type="sandwiches" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sandwichState} 
        onUpdateState={(ns) => setSandwichState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit}
        initialItems={SANDWICH_ITEMS} fullOrderSummary={fullOrderSummary} 
        updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem}
      />
      <SpecialModal 
        isOpen={activeModal === 'trays'} onClose={() => setActiveModal(null)} title="صواني وطواجن" 
        image="https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg"
        type="trays" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={trayState} 
        onUpdateState={(ns) => setTrayState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit}
        initialItems={TRAY_ITEMS} fullOrderSummary={fullOrderSummary}
        updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem}
      />
      <SpecialModal 
        isOpen={activeModal === 'sweets'} onClose={() => setActiveModal(null)} title="حلويات يا عم" 
        image="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80"
        type="sweets" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sweetState} 
        onUpdateState={(ns) => setSweetState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit}
        initialItems={SWEET_ITEMS} fullOrderSummary={fullOrderSummary}
        updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem}
      />
      <footer className="py-10 text-center text-gray-600 border-t border-white/5 mt-20">
        <img src={LOGO_URL} className="h-16 mx-auto mb-4 grayscale opacity-30" />
        <p className="font-bold text-sm">جميع الحقوق محفوظة لـ يا عم . كوم © 2025</p>
      </footer>
    </div>
  );
};
export default App;
