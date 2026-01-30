
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import SpecialModal from './components/SpecialModals';
import GeminiAssistant from './components/GeminiAssistant';
import { LOGO_URL, SANDWICH_ITEMS, TRAY_ITEMS, SWEET_ITEMS } from './constants';
import { SpecialOrderState } from './types';
import { Utensils, IceCream, Sandwich, ShoppingBasket, X, Trash2, Send, Plus, Minus, Truck, Loader2, Sparkles, MessageCircle } from 'lucide-react';

const DELIVERY_FEE = 20;
const EXTRA_CHEESE_PRICE = 5;
const SPICY_PEPPERS_PRICE = 3;

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'sandwiches' | 'trays' | 'sweets' | null>(null);
  const [isGlobalSummaryOpen, setIsGlobalSummaryOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sandwichState, setSandwichState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])),
    hasSecretSauce: false,
    breadChoices: {},
    extraCheese: {},
    spicyPeppers: {}
  });
  
  const [trayState, setTrayState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0]))
  });
  
  const [sweetState, setSweetState] = useState<SpecialOrderState>({
    quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0]))
  });

  const updateGlobalQuantity = (name: string, category: string, delta: number) => {
    const update = (prev: SpecialOrderState) => ({
      ...prev,
      quantities: { ...prev.quantities, [name]: Math.max(0, (prev.quantities[name] || 0) + delta) }
    });
    if (category === 'sandwiches') setSandwichState(update);
    else if (category === 'trays') setTrayState(update);
    else if (category === 'sweets') setSweetState(update);
  };

  const removeGlobalItem = (name: string, category: string) => {
    const reset = (prev: SpecialOrderState) => ({ ...prev, quantities: { ...prev.quantities, [name]: 0 } });
    if (category === 'sandwiches') setSandwichState(reset);
    else if (category === 'trays') setTrayState(reset);
    else if (category === 'sweets') setSweetState(reset);
  };

  const subtotal = useMemo(() => {
    const calc = (state: SpecialOrderState, items: {name: string, price: number}[], isSandwich: boolean = false) => {
      let sum = items.reduce((acc, item) => {
        const qty = state.quantities[item.name] || 0;
        let itemPrice = item.price;
        if (isSandwich && qty > 0) {
          if (state.extraCheese?.[item.name]) itemPrice += EXTRA_CHEESE_PRICE;
          if (state.spicyPeppers?.[item.name]) itemPrice += SPICY_PEPPERS_PRICE;
        }
        return acc + (itemPrice * qty);
      }, 0);
      return sum;
    };
    let total = calc(sandwichState, SANDWICH_ITEMS, true) + calc(trayState, TRAY_ITEMS) + calc(sweetState, SWEET_ITEMS);
    if (sandwichState.hasSecretSauce) total += 10;
    return total;
  }, [sandwichState, trayState, sweetState]);

  const globalTotal = useMemo(() => subtotal > 0 ? subtotal + DELIVERY_FEE : 0, [subtotal]);

  const fullOrderSummary = useMemo(() => {
    const summary: any[] = [];
    SANDWICH_ITEMS.forEach(item => {
      const q = sandwichState.quantities[item.name] || 0;
      if (q > 0) summary.push({ 
        name: item.name, 
        quantity: q, 
        price: item.price, 
        bread: sandwichState.breadChoices?.[item.name] || 'baladi', 
        category: 'sandwiches',
        extraCheese: sandwichState.extraCheese?.[item.name],
        spicyPeppers: sandwichState.spicyPeppers?.[item.name]
      });
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

  const handleFinalSubmit = async (info: any) => {
    if (!info.name || !info.phone || !info.address) {
      alert('يا عم لازم تكتب بياناتك عشان نجيلك!');
      return;
    }
    
    setIsSubmitting(true);

    const orderText = fullOrderSummary
      .map(item => {
        let text = `- ${item.name} (${item.quantity} قطع)`;
        if (item.category === 'sandwiches') {
          const breadText = item.bread === 'baladi' ? 'بلدي' : 'فينو';
          const extras = [];
          if (item.extraCheese) extras.push('جبنة زيادة');
          if (item.spicyPeppers) extras.push('شطة زيادة');
          text += ` [عيش ${breadText}${extras.length > 0 ? `, ${extras.join(' + ')}` : ''}]`;
        }
        text += ` - ${item.price * item.quantity} ج.م`;
        return text;
      })
      .join('\n');

    const payload = {
      name: info.name,
      phone: info.phone,
      address: info.address,
      order_details: orderText + (sandwichState.hasSecretSauce ? '\n+ صوص أعجوبة السحري (10 ج.م)' : ''),
      subtotal: `${subtotal} ج.م`,
      delivery: `${DELIVERY_FEE} ج.م`,
      total_amount: `${globalTotal} ج.م`,
      secret_sauce: sandwichState.hasSecretSauce ? 'نعم' : 'لا'
    };

    try {
      const response = await fetch('https://formspree.io/f/xdazllep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsGlobalSummaryOpen(false);
          setActiveModal(null);
          // Reset Cart
          setSandwichState({ 
            quantities: Object.fromEntries(SANDWICH_ITEMS.map(i => [i.name, 0])), 
            hasSecretSauce: false, 
            breadChoices: {},
            extraCheese: {},
            spicyPeppers: {}
          });
          setTrayState({ quantities: Object.fromEntries(TRAY_ITEMS.map(i => [i.name, 0])) });
          setSweetState({ quantities: Object.fromEntries(SWEET_ITEMS.map(i => [i.name, 0])) });
        }, 4000);
      } else {
        alert('حصل مشكلة يا عم في الإرسال، جرب تاني');
      }
    } catch (error) {
      alert('في عطل في الشبكة يا عم!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItemCount = useMemo(() => {
    return fullOrderSummary.reduce((a, b) => a + b.quantity, 0);
  }, [fullOrderSummary]);

  return (
    <div className="min-h-screen bg-black text-white font-['Cairo'] relative pb-32">
      <main className="max-w-7xl mx-auto px-4 pt-10">
        <Hero />
        
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('sandwiches')} className="cursor-pointer bg-[#FAB520] p-8 rounded-[3rem] flex flex-col items-center gap-6 text-center group">
            <Sandwich className="w-20 h-20 text-black group-hover:rotate-12 transition-transform" />
            <div><h3 className="text-3xl font-black text-black">ركن السندوتشات</h3><p className="text-black/60 font-bold mt-2">كبدة وسجق وحواوشي نار</p></div>
            <div className="bg-black text-white px-8 py-3 rounded-2xl font-black shadow-xl">اطلب السندوتشات</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('trays')} className="cursor-pointer bg-white/5 border-4 border-[#FAB520] p-8 rounded-[3rem] flex flex-col items-center gap-6 text-center group">
            <Utensils className="w-20 h-20 text-[#FAB520] group-hover:rotate-12 transition-transform" />
            <div><h3 className="text-3xl font-black text-[#FAB520]">صواني وطواجن</h3><p className="text-white/40 font-bold mt-2">أكل بيتي يرم العضم</p></div>
            <div className="bg-[#FAB520] text-black px-8 py-3 rounded-2xl font-black shadow-xl">شوف الصواني</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('sweets')} className="cursor-pointer bg-white/10 p-8 rounded-[3rem] flex flex-col items-center gap-6 text-center group">
            <IceCream className="w-20 h-20 text-white group-hover:rotate-12 transition-transform" />
            <div><h3 className="text-3xl font-black text-white">حلويات يا عم</h3><p className="text-white/40 font-bold mt-2">عشان تحلي بعد الأكلة</p></div>
            <div className="bg-white/10 text-white px-8 py-3 rounded-2xl font-black shadow-xl">حلّي بؤك</div>
          </motion.div>
        </section>

        <section className="mt-20 bg-[#FAB520] text-black rounded-[4rem] p-12 text-center overflow-hidden relative shadow-[0_20px_60px_rgba(250,181,32,0.2)]">
          <motion.div animate={{ x: [-300, 1500] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute bottom-4 left-0 text-5xl opacity-10 pointer-events-none">🛵💨💨💨</motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div><p className="text-5xl font-black">+10,000</p><p className="text-lg font-bold opacity-70">أكيل راضي</p></div>
            <div><p className="text-5xl font-black">25 دقيقة</p><p className="text-lg font-bold opacity-70">سرعة دليفري خرافية</p></div>
            <div><p className="text-5xl font-black">طازة 100%</p><p className="text-lg font-bold opacity-70">جودة يا عم المعهودة</p></div>
          </div>
        </section>
      </main>

      {/* Floating Buttons */}
      <motion.button 
        initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
        onClick={() => setIsGlobalSummaryOpen(true)} 
        className="fixed bottom-8 left-8 z-50 bg-[#FAB520] text-black p-5 rounded-full shadow-[0_15px_40px_rgba(250,181,32,0.4)] border-4 border-black flex items-center gap-3"
      >
        <div className="relative">
          <ShoppingBasket className="w-10 h-10" />
          {totalItemCount > 0 && <span className="absolute -top-3 -right-3 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white">{totalItemCount}</span>}
        </div>
        <span className="font-black hidden md:inline">سلتك يا عم</span>
      </motion.button>

      <GeminiAssistant />

      <motion.a 
        href="https://wa.me/201010373331" target="_blank"
        initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-5 rounded-full shadow-2xl border-4 border-white"
      >
        <MessageCircle className="w-10 h-10" />
      </motion.a>

      <AnimatePresence>
        {isGlobalSummaryOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGlobalSummaryOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="relative w-full max-w-xl bg-[#080808] border-t-4 border-[#FAB520] md:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col max-h-[92vh] shadow-[0_0_100px_rgba(250,181,32,0.3)]">
              {showSuccess ? (
                <div className="p-20 text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#FAB520] w-24 h-24 rounded-full flex items-center justify-center mx-auto text-black mb-6 shadow-2xl"><Send className="w-12 h-12" /></motion.div>
                  <h2 className="text-4xl font-black">طلبك طار عندنا!</h2>
                  <p className="text-xl text-gray-400 font-bold italic">"هيكون عندك خلال 25 دقيقة بالضبط يا عم"</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-black flex items-center gap-3"><ShoppingBasket className="text-[#FAB520]" /> راجع سلتك يا عم</h2>
                    <button onClick={() => setIsGlobalSummaryOpen(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {fullOrderSummary.length === 0 ? (
                      <div className="text-center py-20 opacity-30 font-black text-xl flex flex-col items-center gap-4">
                        <ShoppingBasket className="w-20 h-20" />
                        السلة لسه مفيهاش حاجة!
                      </div>
                    ) : (
                      <>
                        {fullOrderSummary.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div>
                              <p className="font-black">{item.name}</p>
                              <div className="flex flex-wrap gap-2 items-center">
                                <p className="text-xs text-gray-400 font-bold">
                                  {item.quantity} × {item.price} ج.م 
                                  {item.category === 'sandwiches' && ` - عيش ${item.bread === 'baladi' ? 'بلدي' : 'فينو'}`}
                                </p>
                                {item.extraCheese && <span className="text-[10px] bg-[#FAB520]/20 text-[#FAB520] px-1.5 py-0.5 rounded font-black">+ جبنة</span>}
                                {item.spicyPeppers && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-black">+ شطة</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-[#FAB520]">{(item.price + (item.extraCheese ? EXTRA_CHEESE_PRICE : 0) + (item.spicyPeppers ? SPICY_PEPPERS_PRICE : 0)) * item.quantity} ج.م</span>
                              <button onClick={() => removeGlobalItem(item.name, item.category)} className="text-red-500 hover:scale-110 active:scale-90 transition-all"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </div>
                        ))}
                        {sandwichState.hasSecretSauce && (
                          <div className="flex justify-between items-center bg-[#FAB520]/10 p-4 rounded-2xl border border-[#FAB520]/30 animate-pulse">
                            <span className="font-black text-[#FAB520] flex items-center gap-2"><Sparkles className="w-4 h-4" /> صوص أعجوبة السحري</span>
                            <span className="font-black text-[#FAB520]">10 ج.م</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-8 border-t border-white/10 bg-white/5 space-y-6 pb-12">
                    <div className="flex justify-between items-center text-xl font-black">
                      <span>إجمالي الطلب:</span>
                      <div className="text-right">
                        <span className="text-4xl text-[#FAB520]">{globalTotal} ج.م</span>
                        <p className="text-[10px] text-gray-500">شامل خدمة التوصيل (20 ج.م)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input placeholder="اسمك إيه يا عم؟" className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-black" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                      <input placeholder="رقم التليفون" className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] font-black text-left" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                      <textarea placeholder="العنوان فين بالضبط؟" className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-[#FAB520] h-24 font-black" value={userInfo.address} onChange={e => setUserInfo({...userInfo, address: e.target.value})} />
                      <button onClick={() => handleFinalSubmit(userInfo)} disabled={isSubmitting || fullOrderSummary.length === 0} className="w-full bg-[#FAB520] text-black font-black py-5 rounded-[2rem] text-2xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-transform disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin w-8 h-8" /> : <Send />}
                        اطلب دلوقتي يا عم
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SpecialModal isOpen={activeModal === 'sandwiches'} onClose={() => setActiveModal(null)} title="ركن السندوتشات" image="https://sayedsamkary.com/unnamed.jpg" type="sandwiches" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sandwichState} onUpdateState={(ns) => setSandwichState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit} initialItems={SANDWICH_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} isSubmitting={isSubmitting} />
      <SpecialModal isOpen={activeModal === 'trays'} onClose={() => setActiveModal(null)} title="صواني وطواجن" image="https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg" type="trays" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={trayState} onUpdateState={(ns) => setTrayState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit} initialItems={TRAY_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} isSubmitting={isSubmitting} />
      <SpecialModal isOpen={activeModal === 'sweets'} onClose={() => setActiveModal(null)} title="حلويات يا عم" image="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80" type="sweets" globalTotal={globalTotal} subtotal={subtotal} deliveryFee={DELIVERY_FEE} persistentState={sweetState} onUpdateState={(ns) => setSweetState(ns as SpecialOrderState)} onFinalSubmit={handleFinalSubmit} initialItems={SWEET_ITEMS} fullOrderSummary={fullOrderSummary} updateGlobalQuantity={updateGlobalQuantity} removeGlobalItem={removeGlobalItem} isSubmitting={isSubmitting} />
      
      <footer className="py-12 text-center text-white/20 font-black italic border-t border-white/5 mt-20">
        <p>جميع الحقوق محفوظة لـ يا عم . كوم © 2025</p>
      </footer>
    </div>
  );
};

export default App;
