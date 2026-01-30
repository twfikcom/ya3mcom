
// Data Constants
const SANDWICH_ITEMS = [
  { name: 'كبدة إسكندراني', price: 25 },
  { name: 'سجق بلدي', price: 30 },
  { name: 'حواوشي يا عم', price: 45 },
];
const TRAY_ITEMS = [
  { name: 'صينية مكرونة بشاميل لحم بلدي (تكفي 5 أفراد)', price: 365 },
  { name: 'صينية كوسة بالبشاميل لحم بلدي (تكفي 5 أفراد)', price: 365 },
];
const SWEET_ITEMS = [
  { name: 'رز بلبن قنبلة', price: 40 },
  { name: 'أم علي بالمكسرات', price: 55 },
  { name: 'صينية كنافة بلدي بالموز', price: 250 },
  { name: 'طبق قطايف (يكفي 4 أفراد)', price: 250 },
];

const CATEGORIES = [
  { id: 'sandwiches', title: 'ركن السندوتشات', icon: 'sandwich', color: 'bg-[#FAB520]', text: 'text-black', items: SANDWICH_ITEMS, image: 'https://sayedsamkary.com/unnamed.jpg' },
  { id: 'trays', title: 'صواني وطواجن', icon: 'utensils', color: 'bg-white/5 border-4 border-[#FAB520]', text: 'text-[#FAB520]', items: TRAY_ITEMS, image: 'https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg' },
  { id: 'sweets', title: 'حلويات يا عم', icon: 'ice-cream', color: 'bg-white/10', text: 'text-white', items: SWEET_ITEMS, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80' }
];

// App State
let cart = {}; // { itemName: { quantity, price, category, bread } }
let hasSecretSauce = false;
const DELIVERY_FEE = 20;

// Initialize Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Preloader Logic
function startPreloader() {
  const loaderBar = document.getElementById('loader-bar');
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('opacity-0');
        setTimeout(() => {
          preloader.style.display = 'none';
          mainContent.classList.remove('opacity-0');
          mainContent.classList.add('opacity-100');
        }, 700);
      }, 500);
    }
    loaderBar.style.width = `${progress}%`;
  }, 150);
}

// Render Category Cards
function renderCategories() {
  const container = document.getElementById('category-list');
  if(!container) return;
  container.innerHTML = CATEGORIES.map((cat, i) => `
    <div onclick="openModal('${cat.id}')" class="category-card cursor-pointer ${cat.color} p-8 md:p-10 rounded-[3rem] flex flex-col items-center justify-center text-center gap-4 group relative shadow-2xl overflow-hidden">
      <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <i data-lucide="${cat.icon}" class="w-20 h-20 md:w-24 md:h-24 ${cat.text} group-hover:rotate-12 transition-transform duration-500"></i>
      <h3 class="text-4xl font-normal font-['Lalezar'] ${cat.text}">${cat.title}</h3>
      <div class="${cat.id === 'sandwiches' ? 'bg-black text-[#FAB520]' : 'bg-[#FAB520] text-black'} px-8 py-3 rounded-xl font-bold text-lg">دخول المتجر</div>
    </div>
  `).join('');
  initIcons();
}

// Modal Logic
function openModal(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('category-modal');
  
  modal.innerHTML = `
    <div class="relative h-40 md:h-64 shrink-0">
      <img src="${cat.image}" class="w-full h-full object-cover" alt="${cat.title}">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent"></div>
      <button onclick="closeModal()" class="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white backdrop-blur-md z-20"><i data-lucide="x" class="w-6 h-6"></i></button>
      <div class="absolute bottom-6 right-8 z-10">
        <h2 class="text-3xl md:text-6xl font-normal text-white drop-shadow-lg font-['Lalezar']">${cat.title}</h2>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto px-5 md:px-10 py-6 space-y-6 scrollbar-hide" id="modal-items">
      ${cat.id === 'sandwiches' ? `
        <div onclick="toggleSecretSauce()" id="sauce-btn" class="p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${hasSecretSauce ? 'bg-[#FAB520] border-black text-black' : 'bg-white/5 border-dashed border-[#FAB520]/20'}">
          <div class="flex items-center gap-3">
            <i data-lucide="sparkles" class="w-5 h-5 ${hasSecretSauce ? 'text-black' : 'text-[#FAB520]'}"></i>
            <div>
              <h4 class="font-bold text-lg">صوص أعجوبة السحري ✨</h4>
              <p class="text-[10px] opacity-60">خلطة يا عم السرية للطلب كله (+10 ج.م)</p>
            </div>
          </div>
          <div class="w-10 h-5 rounded-full relative ${hasSecretSauce ? 'bg-black' : 'bg-white/10'}">
              <div class="absolute top-1 w-3 h-3 rounded-full transition-all ${hasSecretSauce ? 'right-1 bg-[#FAB520]' : 'left-1 bg-gray-500'}"></div>
          </div>
        </div>
      ` : ''}
      <div class="space-y-5">
        ${cat.items.map(item => {
          const qty = cart[item.name]?.quantity || 0;
          const bread = cart[item.name]?.bread || 'baladi';
          return `
            <div class="p-5 md:p-6 rounded-[2rem] border-2 transition-all ${qty > 0 ? 'bg-white/5 border-[#FAB520] shadow-xl' : 'bg-white/5 border-transparent'}">
              <div class="flex items-center justify-between gap-3">
                <div class="flex-1">
                  <h3 class="text-xl md:text-2xl font-bold mb-1">${item.name}</h3>
                  <p class="text-[#FAB520] font-bold text-lg">${item.price} ج.م</p>
                </div>
                <div class="flex items-center gap-4 bg-black p-2 rounded-xl border border-white/10">
                  <button onclick="updateQty('${item.name}', -1, ${item.price}, '${cat.id}')" class="text-[#FAB520] p-1.5 active:scale-125 transition-transform"><i data-lucide="minus" class="w-5 h-5"></i></button>
                  <span class="text-2xl font-bold w-6 text-center" id="modal-qty-${item.name}">${qty}</span>
                  <button onclick="updateQty('${item.name}', 1, ${item.price}, '${cat.id}')" class="text-[#FAB520] p-1.5 active:scale-125 transition-transform"><i data-lucide="plus" class="w-5 h-5"></i></button>
                </div>
              </div>
              ${cat.id === 'sandwiches' && item.name !== 'حواوشي يا عم' ? `
                <div class="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 bread-options ${qty > 0 ? '' : 'hidden'}" id="bread-${item.name}">
                  <button onclick="setBread('${item.name}', 'baladi')" class="bread-btn py-3 rounded-xl font-bold text-base transition-all ${bread === 'baladi' ? 'bread-btn-active' : 'bg-white/5 text-gray-500'}" data-bread="baladi">عيش بلدي</button>
                  <button onclick="setBread('${item.name}', 'western')" class="bread-btn py-3 rounded-xl font-bold text-base transition-all ${bread === 'western' ? 'bread-btn-active' : 'bg-white/5 text-gray-500'}" data-bread="western">عيش فينو فرنسي</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <div class="p-6 md:p-10 bg-black/95 backdrop-blur-md border-t border-white/5 shrink-0 pb-10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
      <div class="flex flex-col md:flex-row justify-between items-center gap-5 mb-1">
        <div class="flex flex-col items-center md:items-start">
          <span class="text-gray-500 font-bold text-base">الإجمالي التقريبي:</span>
          <span class="text-4xl font-bold text-[#FAB520] tracking-tight" id="modal-subtotal">0 ج.م</span>
        </div>
        <div class="flex gap-4 w-full md:w-auto">
            <button onclick="closeModal()" class="flex-1 md:px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10">تكملة الطلب</button>
            <button onclick="toggleCart(); closeModal();" class="flex-1 md:px-10 py-4 bg-[#FAB520] text-black rounded-2xl font-bold text-2xl font-['Lalezar'] shadow-lg">تثبيت الأكلة</button>
        </div>
      </div>
    </div>
  `;

  overlay.style.display = 'block';
  setTimeout(() => modal.classList.add('open'), 10);
  updateModalSubtotal();
  initIcons();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('category-modal');
  modal.classList.remove('open');
  setTimeout(() => overlay.style.display = 'none', 500);
}

// Cart Logic
function toggleCart() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay.style.display === 'block') {
    drawer.classList.remove('open');
    setTimeout(() => overlay.style.display = 'none', 500);
  } else {
    overlay.style.display = 'block';
    renderCart();
    setTimeout(() => drawer.classList.add('open'), 10);
  }
}

function updateQty(name, delta, price, category) {
  if (!cart[name]) {
    cart[name] = { quantity: 0, price: price, category: category, bread: 'baladi' };
  }
  cart[name].quantity = Math.max(0, cart[name].quantity + delta);
  if (cart[name].quantity === 0) {
    delete cart[name];
  }
  
  // Update UI components
  const modalQty = document.getElementById(`modal-qty-${name}`);
  if (modalQty) modalQty.innerText = cart[name]?.quantity || 0;
  
  const breadOpts = document.getElementById(`bread-${name}`);
  if (breadOpts) {
    if (cart[name]?.quantity > 0) breadOpts.classList.remove('hidden');
    else breadOpts.classList.add('hidden');
  }
  
  updateCartUI();
  updateModalSubtotal();
}

function setBread(name, type) {
  if (cart[name]) {
    cart[name].bread = type;
    // Update active class in modal
    const breadContainer = document.getElementById(`bread-${name}`);
    if (breadContainer) {
      breadContainer.querySelectorAll('.bread-btn').forEach(btn => {
        if (btn.dataset.bread === type) btn.classList.add('bread-btn-active');
        else {
          btn.classList.remove('bread-btn-active');
          btn.classList.add('bg-white/5');
          btn.classList.add('text-gray-500');
        }
      });
    }
  }
}

function toggleSecretSauce() {
  hasSecretSauce = !hasSecretSauce;
  const btn = document.getElementById('sauce-btn');
  if (hasSecretSauce) {
    btn.classList.add('bg-[#FAB520]', 'border-black', 'text-black');
    btn.classList.remove('bg-white/5', 'border-dashed', 'border-[#FAB520]/20');
  } else {
    btn.classList.remove('bg-[#FAB520]', 'border-black', 'text-black');
    btn.classList.add('bg-white/5', 'border-dashed', 'border-[#FAB520]/20');
  }
  updateCartUI();
  updateModalSubtotal();
  initIcons();
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  if(badge) {
    badge.innerText = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total');
  if(!container) return;
  
  const cartArray = Object.entries(cart);
  
  if (cartArray.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
        <i data-lucide="shopping-basket" class="w-24 h-24"></i>
        <p class="text-xl font-bold text-center">السلة لسه مفيهاش حاجة يا عم!</p>
      </div>
    `;
    if(footer) footer.classList.add('hidden');
  } else {
    container.innerHTML = cartArray.map(([name, item]) => `
      <div class="p-5 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-xl leading-tight mb-1">${name}</h4>
            ${item.category === 'sandwiches' && name !== 'حواوشي يا عم' ? `<span class="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">خبز ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}</span>` : ''}
          </div>
          <button onclick="updateQty('${name}', -999, 0, '')" class="text-gray-600 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>
        <div class="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
          <span class="text-2xl font-bold text-[#FAB520]">${item.quantity * item.price} ج.م</span>
          <div class="flex items-center gap-4">
            <button onclick="updateQty('${name}', -1, ${item.price}, '${item.category}')" class="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125 transition-transform"><i data-lucide="minus" class="w-4 h-4"></i></button>
            <span class="font-bold text-xl w-6 text-center">${item.quantity}</span>
            <button onclick="updateQty('${name}', 1, ${item.price}, '${item.category}')" class="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125 transition-transform"><i data-lucide="plus" class="w-4 h-4"></i></button>
          </div>
        </div>
      </div>
    `).join('') + `<div class="p-5 bg-[#FAB520]/5 rounded-2xl border border-dashed border-[#FAB520]/30 flex justify-between items-center text-[#FAB520] font-bold text-sm">
        <div class="flex items-center gap-2"><i data-lucide="truck" class="w-5 h-5"></i><span>ملحوظة: مصاريف التوصيل</span></div>
        <span class="text-lg">${DELIVERY_FEE} ج.م</span>
      </div>`;
    
    if(footer) footer.classList.remove('hidden');
    
    let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (hasSecretSauce) subtotal += 10;
    if(totalEl) totalEl.innerText = `${subtotal + DELIVERY_FEE} ج.م`;
  }
  initIcons();
}

function updateModalSubtotal() {
  const el = document.getElementById('modal-subtotal');
  if (!el) return;
  let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (hasSecretSauce) subtotal += 10;
  el.innerText = `${subtotal} ج.م`;
}

// Order Form Submission
const orderForm = document.getElementById('order-form');
if(orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const address = document.getElementById('form-address').value;
    const notes = document.getElementById('form-notes').value;
    const btn = document.getElementById('submit-btn');
    
    if (!name || !phone || !address) return;
    
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-8 h-8 loading-spin"></i><span>جاري الطيران...</span>`;
    initIcons();
  
    try {
      const orderDetails = Object.entries(cart).map(([name, item]) => 
        `- ${name} (${item.quantity}) ${item.category === 'sandwiches' ? `[خبز ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنسي'}]` : ''}`
      ).join('\n');
      
      let subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (hasSecretSauce) subtotal += 10;
      
      const response = await fetch("https://formspree.io/f/xdazllep", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            الاسم: name,
            التليفون: phone,
            العنوان: address,
            الملاحظات: notes,
            الطلب: orderDetails,
            الإجمالي: (subtotal + DELIVERY_FEE) + " ج.م"
        })
      });
  
      if (response.ok) {
        document.getElementById('success-screen').style.display = 'flex';
        setTimeout(() => {
          location.reload();
        }, 4000);
      } else {
        alert('يا عم حصل غلط في الإرسال، جرب تاني!');
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" class="w-8 h-8"></i><span>اطلب الآن يا عم!</span>`;
        initIcons();
      }
    } catch (err) {
      alert('يا عم النت فيه مشكلة، جرب تاني!');
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="send" class="w-8 h-8"></i><span>اطلب الآن يا عم!</span>`;
      initIcons();
    }
  });
}

// Start Everything
window.onload = () => {
  startPreloader();
  renderCategories();
};
