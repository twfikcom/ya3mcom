
// Static Business Logic for Ya3m Food Delivery
const SANDWICH_ITEMS = [
    { name: 'كبدة إسكندراني', price: 25 },
    { name: 'سجق بلدي', price: 30 },
    { name: 'حواوشي يا عم', price: 45 },
];

const TRAY_ITEMS = [
    { name: 'صينية مكرونة بشاميل بلدي', price: 365 },
    { name: 'صينية كوسة بالبشاميل بلدي', price: 365 },
];

const SWEET_ITEMS = [
    { name: 'رز بلبن قنبلة', price: 40 },
    { name: 'أم علي بالمكسرات', price: 55 },
    { name: 'صينية كنافة بلدي بالموز', price: 250 },
    { name: 'طبق قطايف 4 أفراد', price: 250 },
];

const DELIVERY_FEE = 20;
let cart: Record<string, { qty: number; price: number }> = {};

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    // @ts-ignore
    lucide.createIcons();
    renderAllLists();
    updateUI();
});

// Modal Logic
(window as any).openModal = (id: string) => {
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
};

(window as any).closeModal = (id: string) => {
    document.getElementById(id)?.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Rendering Food Items
function renderAllLists() {
    const render = (containerId: string, items: typeof SANDWICH_ITEMS) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = items.map(item => `
            <div class="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-[#FAB520]/40 transition-all">
                <div>
                    <h4 class="font-black text-2xl text-white">${item.name}</h4>
                    <p class="primary-text font-black text-lg mt-1">${item.price} ج.م</p>
                </div>
                <div class="flex items-center gap-6 bg-black/50 p-3 rounded-2xl border border-white/10 shadow-inner">
                    <button onclick="updateQty('${item.name}', -1, ${item.price})" class="primary-text hover:scale-125 transition-transform"><i data-lucide="minus-circle" class="w-8 h-8"></i></button>
                    <span id="qty-${item.name.replace(/\s+/g, '-')}" class="font-black text-3xl w-10 text-center">${cart[item.name]?.qty || 0}</span>
                    <button onclick="updateQty('${item.name}', 1, ${item.price})" class="primary-text hover:scale-125 transition-transform"><i data-lucide="plus-circle" class="w-8 h-8"></i></button>
                </div>
            </div>
        `).join('');
    };

    render('list-sandwiches', SANDWICH_ITEMS);
    render('list-trays', TRAY_ITEMS);
    render('list-sweets', SWEET_ITEMS);
    // @ts-ignore
    lucide.createIcons();
}

// Cart Management
(window as any).updateQty = (name: string, delta: number, price: number) => {
    if (!cart[name]) cart[name] = { qty: 0, price: price };
    cart[name].qty = Math.max(0, cart[name].qty + delta);
    
    // UI Update for the specific counter
    const qtyEl = document.getElementById(`qty-${name.replace(/\s+/g, '-')}`);
    if (qtyEl) qtyEl.innerText = cart[name].qty.toString();
    
    updateUI();
};

function updateUI() {
    const countBadge = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');
    const finalTotalEl = document.getElementById('final-total');
    
    let total = 0;
    let itemCount = 0;
    let itemsHtml = '';

    Object.entries(cart).forEach(([name, data]) => {
        if (data.qty > 0) {
            itemCount += data.qty;
            total += data.qty * data.price;
            itemsHtml += `
                <div class="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/10 animate__animated animate__fadeIn">
                    <div>
                        <p class="font-black text-xl">${name}</p>
                        <p class="text-sm text-gray-500 font-bold mt-1">${data.qty} × ${data.price} ج.م</p>
                    </div>
                    <div class="text-right">
                        <p class="primary-text font-black text-xl">${data.qty * data.price} ج.م</p>
                        <button onclick="updateQty('${name}', -${data.qty}, 0)" class="text-red-500 text-xs font-bold mt-2 underline">حذف</button>
                    </div>
                </div>
            `;
        }
    });

    // Update Floating Button
    if (countBadge) {
        if (itemCount > 0) {
            countBadge.innerText = itemCount.toString();
            countBadge.classList.remove('hidden');
        } else {
            countBadge.classList.add('hidden');
        }
    }

    // Update Cart Modal
    if (cartContainer) {
        if (itemCount > 0) {
            cartContainer.innerHTML = itemsHtml + `
                <div class="p-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex justify-between items-center text-gray-400">
                    <span class="font-black">خدمة التوصيل</span>
                    <span class="font-black">${DELIVERY_FEE} ج.م</span>
                </div>
            `;
        } else {
            cartContainer.innerHTML = '<div class="text-center py-20 opacity-30 font-black text-xl">السلة فاضية يا عم، اطلب حاجة!</div>';
        }
    }

    // Final Total Calculation
    const grandTotal = itemCount > 0 ? total + DELIVERY_FEE : 0;
    if (finalTotalEl) finalTotalEl.innerText = `${grandTotal} ج.م`;

    // Hidden Fields for Formspree
    const hiddenOrder = document.getElementById('hidden-order') as HTMLInputElement;
    const hiddenTotal = document.getElementById('hidden-total') as HTMLInputElement;
    if (hiddenOrder) hiddenOrder.value = Object.entries(cart).filter(([_, d]) => d.qty > 0).map(([n, d]) => `${n} (${d.qty})`).join(' | ');
    if (hiddenTotal) hiddenTotal.value = `${grandTotal} ج.م`;
    
    // @ts-ignore
    lucide.createIcons();
}

// Form Submission handling
const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement;
if (checkoutForm) {
    checkoutForm.onsubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        
        const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);
        if (cartCount === 0) {
            alert('السلة فاضية يا عم، لازم تطلب حاجة الأول!');
            return;
        }

        const btn = document.getElementById('submit-btn') as HTMLButtonElement;
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = 'جاري الطيران بالطلب...';

        try {
            const formData = new FormData(checkoutForm);
            const response = await fetch(checkoutForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                document.getElementById('success-view')?.classList.remove('hidden');
                document.getElementById('success-view')?.classList.add('flex');
                // Reset cart
                cart = {};
                updateUI();
                renderAllLists();
                setTimeout(() => {
                    location.reload();
                }, 5000);
            } else {
                alert('حصل مشكلة في الشبكة، جرب تاني يا بطل!');
                btn.disabled = false;
                btn.innerText = originalText;
            }
        } catch (error) {
            alert('النت فيه مشكلة يا عم!');
            btn.disabled = false;
            btn.innerText = originalText;
        }
    };
}
