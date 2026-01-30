
// Vanilla JS Logic for Ya3m Food Delivery
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

// Added type for cart to fix property access errors
let cart: Record<string, { qty: number; price: number }> = {};
const DELIVERY_FEE = 20;

// Initialize Lucide Icons
window.addEventListener('DOMContentLoaded', () => {
    // @ts-ignore
    lucide.createIcons();
    renderFoodLists();
});

// Modal Functions - Cast window to any to allow global assignments
(window as any).openModal = (id: string) => {
    document.getElementById(id)?.classList.add('active');
};

(window as any).closeModal = (id: string) => {
    document.getElementById(id)?.classList.remove('active');
};

// Render Functions
function renderFoodLists() {
    const renderList = (id: string, items: { name: string; price: number }[]) => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = items.map(item => `
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                    <h4 class="font-black text-lg">${item.name}</h4>
                    <p class="primary-text font-bold">${item.price} ج.م</p>
                </div>
                <div class="flex items-center gap-4 bg-black/50 p-2 rounded-xl">
                    <button onclick="updateCart('${item.name}', -1, ${item.price})" class="primary-text p-1"><i data-lucide="minus" class="w-5 h-5"></i></button>
                    <span id="qty-${item.name.replace(/\s+/g, '-')}" class="font-black text-xl w-6 text-center">${cart[item.name]?.qty || 0}</span>
                    <button onclick="updateCart('${item.name}', 1, ${item.price})" class="primary-text p-1"><i data-lucide="plus" class="w-5 h-5"></i></button>
                </div>
            </div>
        `).join('');
        // @ts-ignore
        lucide.createIcons();
    };

    renderList('sandwiches-list', SANDWICH_ITEMS);
    // Note: In a full version, we'd add containers for trays and sweets too.
}

// Cast window to any for updateCart
(window as any).updateCart = (name: string, delta: number, price: number) => {
    if (!cart[name]) cart[name] = { qty: 0, price: price };
    cart[name].qty = Math.max(0, cart[name].qty + delta);
    
    // Update UI
    const qtyEl = document.getElementById(`qty-${name.replace(/\s+/g, '-')}`);
    if (qtyEl) qtyEl.innerText = cart[name].qty.toString();
    
    updateCartSummary();
};

function updateCartSummary() {
    const countEl = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    if (!countEl || !container || !totalEl) return;

    let total = 0;
    let count = 0;
    let html = '';

    Object.entries(cart).forEach(([name, data]) => {
        if (data.qty > 0) {
            count += data.qty;
            total += data.qty * data.price;
            html += `
                <div class="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <div>
                        <p class="font-black">${name}</p>
                        <p class="text-xs text-gray-400">${data.qty} × ${data.price} ج.م</p>
                    </div>
                    <p class="primary-text font-black">${data.qty * data.price} ج.م</p>
                </div>
            `;
        }
    });

    if (count > 0) {
        // Fix: Convert number to string for innerText
        countEl.innerText = count.toString();
        countEl.classList.remove('hidden');
        container.innerHTML = html + `
            <div class="flex justify-between text-gray-500 font-bold border-t border-white/10 pt-4">
                <span>توصيل:</span>
                <span>${DELIVERY_FEE} ج.م</span>
            </div>
        `;
        totalEl.innerText = (total + DELIVERY_FEE) + ' ج.م';
        
        // Fix: Cast elements to HTMLInputElement for value property
        const orderDetailsEl = document.getElementById('hidden-order-details') as HTMLInputElement;
        const totalAmountEl = document.getElementById('hidden-total') as HTMLInputElement;
        
        if (orderDetailsEl) {
            orderDetailsEl.value = Object.entries(cart)
                .filter(([_, d]) => d.qty > 0)
                .map(([n, d]) => `${n} (${d.qty})`)
                .join(', ');
        }
        if (totalAmountEl) {
            totalAmountEl.value = (total + DELIVERY_FEE) + ' ج.م';
        }
    } else {
        countEl.classList.add('hidden');
        container.innerHTML = '<p class="text-gray-500 text-center py-10 font-bold">السلة لسه مفيهاش حاجة يا عم!</p>';
        totalEl.innerText = '0 ج.م';
    }
}

// Form Submission handling - Cast form and button to correct HTML types
const form = document.getElementById('order-form') as HTMLFormElement;
if (form) {
    form.onsubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn') as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'جاري الإرسال...';
        }

        const formData = new FormData(form);
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                document.getElementById('success-overlay')?.classList.remove('hidden');
                document.getElementById('success-overlay')?.classList.add('flex');
                setTimeout(() => {
                    location.reload();
                }, 4000);
            } else {
                alert('يا عم حصل مشكلة، جرب تاني!');
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'إتمام الطلب الآن';
                }
            }
        } catch (error) {
            alert('عطل في الشبكة يا عم!');
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'إتمام الطلب الآن';
            }
        }
    };
}
