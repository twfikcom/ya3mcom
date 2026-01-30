
// Data
const MENU = {
    sandwiches: {
        title: "ركن السندوتشات",
        img: "https://sayedsamkary.com/unnamed.jpg",
        items: [
            { id: "s1", name: 'كبدة إسكندراني', price: 25, bread: true },
            { id: "s2", name: 'سجق بلدي', price: 30, bread: true },
            { id: "s3", name: 'حواوشي يا عم', price: 45, bread: false }
        ]
    },
    trays: {
        title: "صواني وطواجن",
        img: "https://sayedsamkary.com/%D8%B5%D9%8A%D9%86%D9%8A%D8%A9%20%D9%83%D9%88%D8%B3%D8%A9%20%D8%A8%D8%A7%D9%84%D8%A8%D8%B4%D8%A7%D9%85%D9%84.jpg",
        items: [
            { id: "t1", name: 'صينية مكرونة بشاميل لحم بلدي (تكفي 5 أفراد)', price: 365 },
            { id: "t2", name: 'صينية كوسة بالبشاميل لحم بلدي (تكفي 5 أفراد)', price: 365 }
        ]
    },
    sweets: {
        title: "حلويات يا عم",
        img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
        items: [
            { id: "w1", name: 'رز بلبن قنبلة', price: 40 },
            { id: "w2", name: 'أم علي بالمكسرات', price: 55 },
            { id: "w3", name: 'صينية كنافة بلدي بالموز', price: 250 },
            { id: "w4", name: 'طبق قطايف (يكفي 4 أفراد)', price: 250 }
        ]
    }
};

const STATE = {
    cart: [],
    deliveryFee: 20,
    currentCategory: null,
    modalQuantities: {}, // Temporary quantities in modal
    modalBreads: {},
    hasSecretSauce: false
};

// Functions
function openModal(catId) {
    const cat = MENU[catId];
    STATE.currentCategory = catId;
    STATE.modalQuantities = {};
    STATE.modalBreads = {};
    STATE.hasSecretSauce = false;

    document.getElementById('modal-img').src = cat.img;
    document.getElementById('modal-title').innerText = cat.title;
    
    renderModalItems(catId);
    
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-content').classList.add('open');
    }, 10);
    updateModalTotal();
}

function closeModal() {
    document.getElementById('modal-content').classList.remove('open');
    setTimeout(() => {
        document.getElementById('modal-overlay').classList.add('hidden');
    }, 500);
}

function renderModalItems(catId) {
    const container = document.getElementById('modal-items');
    container.innerHTML = '';
    
    // Secret Sauce Option for Sandwiches
    if (catId === 'sandwiches') {
        const sauceDiv = document.createElement('div');
        sauceDiv.className = `p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer sauce-card ${STATE.hasSecretSauce ? 'bg-[#FAB520] border-black text-black' : 'bg-white/5 border-dashed border-[#FAB520]/20 text-white'}`;
        sauceDiv.onclick = () => {
            STATE.hasSecretSauce = !STATE.hasSecretSauce;
            renderModalItems(catId);
            updateModalTotal();
        };
        sauceDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
                <div>
                    <h4 class="font-black text-lg">صوص أعجوبة السحري ✨</h4>
                    <p class="text-[10px] opacity-60">خلطة يا عم السرية للطلب كله (+10 ج.م)</p>
                </div>
            </div>
            <div class="w-10 h-5 rounded-full relative ${STATE.hasSecretSauce ? 'bg-black' : 'bg-white/10'}">
                <div class="absolute top-1 w-3 h-3 rounded-full transition-all ${STATE.hasSecretSauce ? 'right-1 bg-[#FAB520]' : 'left-1 bg-gray-500'}"></div>
            </div>
        `;
        container.appendChild(sauceDiv);
    }

    MENU[catId].items.forEach(item => {
        const qty = STATE.modalQuantities[item.id] || 0;
        const bread = STATE.modalBreads[item.id] || 'baladi';
        
        const card = document.createElement('div');
        card.className = `p-5 md:p-6 rounded-[2rem] border-2 transition-all ${qty > 0 ? 'bg-white/5 border-[#FAB520] shadow-xl' : 'bg-white/5 border-transparent'}`;
        card.innerHTML = `
            <div class="flex items-center justify-between gap-3">
                <div class="flex-1">
                    <h3 class="text-xl md:text-2xl font-black mb-1">${item.name}</h3>
                    <p class="text-[#FAB520] font-black text-lg">${item.price} ج.م</p>
                </div>
                <div class="flex items-center gap-4 bg-black p-2 rounded-xl border border-white/10">
                    <button onclick="updateModalQty('${item.id}', -1)" class="text-[#FAB520] p-1.5 active:scale-125"><i data-lucide="minus" class="w-5 h-5"></i></button>
                    <span class="text-2xl font-black w-6 text-center">${qty}</span>
                    <button onclick="updateModalQty('${item.id}', 1)" class="text-[#FAB520] p-1.5 active:scale-125"><i data-lucide="plus" class="w-5 h-5"></i></button>
                </div>
            </div>
            ${item.bread && qty > 0 ? `
                <div class="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                    <button onclick="setBread('${item.id}', 'baladi')" class="bread-btn py-3 rounded-xl font-black text-base transition-all ${bread === 'baladi' ? 'active' : 'bg-white/5 text-gray-500'}">عيش بلدي</button>
                    <button onclick="setBread('${item.id}', 'western')" class="bread-btn py-3 rounded-xl font-black text-base transition-all ${bread === 'western' ? 'active' : 'bg-white/5 text-gray-500'}">عيش فينو فرنساوي</button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

function updateModalQty(itemId, delta) {
    const current = STATE.modalQuantities[itemId] || 0;
    STATE.modalQuantities[itemId] = Math.max(0, current + delta);
    
    // If quantity is set, sync to main cart logic when "Fixing" the order
    // For now, just update the modal UI
    renderModalItems(STATE.currentCategory);
    updateModalTotal();
    syncModalToCart();
}

function setBread(itemId, type) {
    STATE.modalBreads[itemId] = type;
    renderModalItems(STATE.currentCategory);
    syncModalToCart();
}

function updateModalTotal() {
    let subtotal = 0;
    const items = MENU[STATE.currentCategory].items;
    items.forEach(item => {
        subtotal += (STATE.modalQuantities[item.id] || 0) * item.price;
    });
    if (STATE.hasSecretSauce && subtotal > 0) subtotal += 10;
    document.getElementById('modal-total').innerText = subtotal + " ج.م";
}

function syncModalToCart() {
    // This function moves items from modal state to global cart state
    const catItems = MENU[STATE.currentCategory].items;
    
    catItems.forEach(item => {
        const qty = STATE.modalQuantities[item.id] || 0;
        const existingIdx = STATE.cart.findIndex(c => c.id === item.id);
        
        if (qty > 0) {
            const cartObj = {
                ...item,
                quantity: qty,
                bread: item.bread ? (STATE.modalBreads[item.id] || 'baladi') : null,
                category: STATE.currentCategory
            };
            if (existingIdx > -1) STATE.cart[existingIdx] = cartObj;
            else STATE.cart.push(cartObj);
        } else {
            if (existingIdx > -1) STATE.cart.splice(existingIdx, 1);
        }
    });
    updateCartUI();
}

function toggleCart(show) {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (show) {
        overlay.classList.remove('hidden');
        renderCartItems();
        setTimeout(() => drawer.classList.add('open'), 10);
    } else {
        drawer.classList.remove('open');
        setTimeout(() => overlay.classList.add('hidden'), 500);
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-list');
    container.innerHTML = '';
    
    if (STATE.cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                <i data-lucide="shopping-basket" class="w-24 h-24"></i>
                <p class="text-xl font-black text-center">السلة لسه مفيهاش حاجة يا عم!</p>
            </div>
        `;
        document.getElementById('cart-checkout').classList.add('hidden');
    } else {
        STATE.cart.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = "p-5 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner animate-slide-in";
            div.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-black text-xl leading-tight mb-1">${item.name}</h4>
                        ${item.bread ? `<span class="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">عيش ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنساوي'}</span>` : ''}
                    </div>
                    <button onclick="removeFromCart(${idx})" class="text-gray-600 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                </div>
                <div class="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    <span class="text-xl font-black text-[#FAB520]">${item.quantity * item.price} ج.م</span>
                    <div class="flex items-center gap-4">
                        <button onclick="updateCartQty(${idx}, -1)" class="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125"><i data-lucide="minus" class="w-4 h-4"></i></button>
                        <span class="font-black text-xl w-6 text-center">${item.quantity}</span>
                        <button onclick="updateCartQty(${idx}, 1)" class="text-[#FAB520] bg-white/5 p-1.5 rounded-lg active:scale-125"><i data-lucide="plus" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        
        // Delivery Fee Info
        const feeDiv = document.createElement('div');
        feeDiv.className = "p-5 bg-[#FAB520]/5 rounded-2xl border border-dashed border-[#FAB520]/30 flex justify-between items-center text-[#FAB520] font-black text-sm";
        feeDiv.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="truck" class="w-5 h-5"></i><span>مصاريف التوصيل</span></div><span class="text-lg">${STATE.deliveryFee} ج.م</span>`;
        container.appendChild(feeDiv);
        
        document.getElementById('cart-checkout').classList.remove('hidden');
    }
    
    updateCartTotals();
    lucide.createIcons();
}

function updateCartQty(idx, delta) {
    STATE.cart[idx].quantity = Math.max(1, STATE.cart[idx].quantity + delta);
    // If the item is in the current open modal, sync it back
    if (STATE.currentCategory === STATE.cart[idx].category) {
        STATE.modalQuantities[STATE.cart[idx].id] = STATE.cart[idx].quantity;
        renderModalItems(STATE.currentCategory);
        updateModalTotal();
    }
    renderCartItems();
    updateCartUI();
}

function removeFromCart(idx) {
    const item = STATE.cart[idx];
    if (STATE.currentCategory === item.category) {
        STATE.modalQuantities[item.id] = 0;
        renderModalItems(STATE.currentCategory);
        updateModalTotal();
    }
    STATE.cart.splice(idx, 1);
    renderCartItems();
    updateCartUI();
}

function updateCartTotals() {
    let subtotal = 0;
    STATE.cart.forEach(item => subtotal += item.quantity * item.price);
    if (STATE.hasSecretSauce && subtotal > 0) subtotal += 10;
    
    const final = subtotal > 0 ? subtotal + STATE.deliveryFee : 0;
    document.getElementById('cart-final-total').innerText = final + " ج.م";
    return final;
}

function updateCartUI() {
    const count = STATE.cart.reduce((a, b) => a + b.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

async function handleOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const address = document.getElementById('user-address').value;
    
    if (!name || !phone || !address || STATE.cart.length === 0) return;

    // Formatting order details for email
    let orderDetails = "تفاصيل الطلب:\n";
    STATE.cart.forEach(item => {
        orderDetails += `- ${item.name} (${item.quantity}) | السعر: ${item.price * item.quantity} ج.م`;
        if (item.bread) orderDetails += ` | العيش: ${item.bread === 'baladi' ? 'بلدي' : 'فينو فرنساوي'}`;
        orderDetails += "\n";
    });
    if (STATE.hasSecretSauce) orderDetails += "+ صوص أعجوبة السحري (10 ج.م)\n";
    
    const finalTotal = updateCartTotals();
    orderDetails += `\nالإجمالي النهائي (شامل التوصيل): ${finalTotal} ج.م`;

    // Start Submission
    btn.disabled = true;
    btnText.innerText = "جاري إرسال الطلب...";
    
    try {
        const response = await fetch("https://formspree.io/f/xdazllep", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                الاسم: name,
                التليفون: phone,
                العنوان: address,
                تفاصيل_الطلب: orderDetails,
                الحساب_النهائي: finalTotal + " ج.م"
            })
        });

        if (response.ok) {
            toggleCart(false);
            const success = document.getElementById('success-screen');
            success.classList.remove('hidden');
            
            setTimeout(() => {
                success.classList.add('hidden');
                STATE.cart = [];
                STATE.hasSecretSauce = false;
                updateCartUI();
                document.getElementById('order-form').reset();
            }, 4000);
        } else {
            alert("يا عم حصل مشكلة في الإرسال، جرب تاني!");
        }
    } catch (error) {
        alert("يا عم النت فيه مشكلة، جرب تاني!");
    } finally {
        btn.disabled = false;
        btnText.innerText = "اطلب الآن يا عم!";
    }
}
