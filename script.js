document.addEventListener('DOMContentLoaded', () => {

    // --- YOUR EMAILJS KEYS ---
    const EMAILJS_PUBLIC_KEY = 'jFuguvov1fb98PedB';
    const EMAILJS_SERVICE_ID = 'service_b6b6adn';
    const ADMIN_TEMPLATE_ID = 'template_4fggr58'; 
    const CUSTOMER_TEMPLATE_ID = 'template_wy48qy6';
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // --- NEW PRODUCT DATA STRUCTURE WITH UPDATED PRICES ---
    const products = {
        'turmeric': {
            name: 'Pure Turmeric Powder (Haldi)',
            image: 'images/product2.jpg',
            description: 'Known as "Indian Saffron", our turmeric has a high curcumin content, giving it a rich golden color.',
            variants: [
                { id: 'turmeric-200', size: '200gm', sp: 78, mrp: 97 },
                { id: 'turmeric-500', size: '500gm', sp: 155, mrp: 210 }
            ]
        },
        'coriander': {
            name: 'Coriander Powder (Dhania)',
            image: 'images/product3.jpg',
            description: 'Made from premium quality coriander seeds, this powder has a fresh, citrusy aroma and a mild, sweet flavor.',
            variants: [
                { id: 'coriander-200', size: '200gm', sp: 55, mrp: 75 },
                { id: 'coriander-500', size: '500gm', sp: 145, mrp: 195 }
            ]
        },
        'red-chilli': {
            name: 'Red Chilli Powder (Lal Mircha)',
            image: 'images/product4.jpeg',
            description: 'Sourced from the finest farms, our red chilli powder provides the perfect balance of vibrant color and sharp heat.',
            variants: [
                { id: 'chilli-200', size: '200gm', sp: 90, mrp: 120 },
                { id: 'chilli-500', size: '500gm', sp: 195, mrp: 310 }
            ]
        },
        'garam-masala': {
            name: 'Garam Masala',
            image: 'images/product5.jpg',
            description: 'A classic blend of aromatic spices, perfect for adding a warm and complex flavor to any dish.',
            variants: [
                { id: 'garam-200', size: '200gm', sp: 110, mrp: 145 }
            ]
        },
        'hing': { 
            name: 'Asafoetida (Hing)', 
            image: 'images/product6.jpg', 
            description: 'A powerful and pungent spice...', 
            variants: [{ id: 'hing-50', size: '50gm', sp: 145, mrp: 165 }] 
        },
        // 'atta': { 
        //     name: 'Whole Wheat Atta', 
        //     image: 'images/atta.jpg', 
        //     description: 'Our Atta is made from 100% whole wheat grains...', 
        //     variants: [{ id: 'atta-1kg', size: '1kg', sp: 150, mrp: 180 }] 
        // },
        // 'cumin-seeds': { 
        //     name: 'Cumin Seeds', 
        //     image: 'images/placeholder2.jpg', 
        //     description: 'Whole cumin seeds...', 
        //     variants: [{ id: 'cumin-200', size: '200gm', sp: 110, mrp: 130 }] 
        // },
        // 'black-pepper': { 
        //     name: 'Black Pepper', 
        //     image: 'images/placeholder3.jpg', 
        //     description: 'Freshly ground black pepper...', 
        //     variants: [{ id: 'pepper-100', size: '100gm', sp: 200, mrp: 240 }] 
        // }
    };

    // --- ELEMENTS --- (No changes here)
    const productGrid = document.querySelector('.product-grid');
    const productModal = document.getElementById('product-modal');
    const cartIcon = document.getElementById('cart-icon');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const checkoutModal = document.getElementById('checkout-modal');
    const paymentModal = document.getElementById('payment-modal');
    const thankYouModal = document.getElementById('thank-you-modal');
    const checkoutBtn = document.querySelector('.btn-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const confirmPaymentBtn = document.getElementById('btn-confirm-payment');
    const closeButtons = document.querySelectorAll('.close-button');

    // --- STATE ---
    let cart = {};

    // --- HELPER FUNCTION to consistently format price HTML ---
    function getPriceHtml(variant) {
        let priceHtml = `<span class="price-sp">₹${variant.sp.toFixed(2)}</span>`;
        if (variant.mrp && variant.mrp > variant.sp) {
            priceHtml += ` <span class="price-mrp"><del>₹${variant.mrp.toFixed(2)}</del></span>`;
        }
        return priceHtml;
    }

    // --- RENDER & LOGIC FUNCTIONS (Updated for Variants) ---

    function renderProducts() {
        productGrid.innerHTML = '';
        for (const productId in products) {
            const product = products[productId];
            const defaultVariant = product.variants[0];
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = productId;
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="product-price">
                    ${getPriceHtml(defaultVariant)}
                </div>
                <div class="product-card-footer">
                    <button class="btn-details" data-product-id="${productId}">View Options</button>
                </div>
            `;
            productGrid.appendChild(card);
        }
    }

    function findProductAndVariant(variantId) {
        for (const productId in products) {
            const product = products[productId];
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
                return { product: { name: product.name, image: product.image, description: product.description }, variant };
            }
        }
        return null;
    }
    
    function updateCart(variantId, change) {
        if (!cart[variantId] && change > 0) {
            const { product, variant } = findProductAndVariant(variantId);
            cart[variantId] = { ...product, ...variant, quantity: 1 };
        } else if (cart[variantId]) {
            cart[variantId].quantity += change;
            if (cart[variantId].quantity <= 0) {
                delete cart[variantId];
            }
        }
        updateCartUI();
    }
    
    // --- UPDATED CART UI FUNCTION ---
// --- FINAL CORRECTED CART UI FUNCTION ---
function updateCartUI() {
    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = '';
        checkoutBtn.disabled = false;
        for (const variantId in cart) {
            const item = cart[variantId];
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            // This HTML structure is now optimized for the new CSS
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div>
                        <h4>${item.name} (${item.size})</h4>
                        <p class="cart-item-price">₹${(item.sp * item.quantity).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-quantity-control">
                            <button class="cart-quantity-btn cart-decrease" data-variant-id="${variantId}">-</button>
                            <span class="cart-quantity-display">${item.quantity}</span>
                            <button class="cart-quantity-btn cart-increase" data-variant-id="${variantId}">+</button>
                        </div>
                        <button class="remove-from-cart-btn" data-variant-id="${variantId}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        }
    }
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.sp * item.quantity), 0);
    cartCountSpan.textContent = totalItems;
    cartTotalPriceSpan.textContent = `₹${totalPrice.toFixed(2)}`;
    document.getElementById('payment-amount').textContent = `₹${totalPrice.toFixed(2)}`;
    document.getElementById('checkout-total-price').textContent = `₹${totalPrice.toFixed(2)}`;
}

    function openProductModal(productId) {
        const product = products[productId];
        const modalImg = productModal.querySelector('#modal-img');
        const modalTitle = productModal.querySelector('#modal-title');
        const modalDescription = productModal.querySelector('#modal-description');
        const modalVariants = productModal.querySelector('#modal-variants');
        const modalPriceDisplay = productModal.querySelector('#modal-price-display');
        const modalAddToCartBtn = productModal.querySelector('#modal-add-to-cart');

        modalImg.src = product.image;
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;
        
        modalVariants.innerHTML = product.variants.map(v => 
            `<button class="variant-btn" data-variant-id="${v.id}">${v.size}</button>`
        ).join('');

        modalPriceDisplay.innerHTML = '';
        modalAddToCartBtn.disabled = true;
        modalAddToCartBtn.dataset.selectedVariantId = '';

        modalVariants.onclick = (e) => {
            if (e.target.classList.contains('variant-btn')) {
                modalVariants.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                const selectedVariantId = e.target.dataset.variantId;
                const { variant } = findProductAndVariant(selectedVariantId);
                
                modalPriceDisplay.innerHTML = getPriceHtml(variant);
                modalAddToCartBtn.dataset.selectedVariantId = selectedVariantId;
                modalAddToCartBtn.disabled = false;
            }
        };
        
        productModal.style.display = 'block';
    }

    // --- EMAIL SENDING FUNCTION (Updated to show variant size) ---
    function sendOrderEmail() {
        const orderItemsHtml = Object.values(cart).map(item => 
            `<p style="margin: 5px 0;">${item.name} (${item.size}) (x${item.quantity}) - <strong>₹${(item.sp * item.quantity).toFixed(2)}</strong></p>`
        ).join('');
    
        const orderId = Date.now().toString().slice(-6); 
        const form = document.getElementById('checkout-form');
        const customerAddress = `${form.address.value}, ${form.city.value}, ${form.pincode.value}`;
        const orderTotal = document.getElementById('cart-total-price').textContent;

        const templateParams = {
            order_id: orderId, 
            customer_name: form.fullName.value,
            customer_email: form.email.value,
            customer_phone: form.phone.value,
            customer_address: customerAddress,
            order_items: orderItemsHtml,
            order_total: orderTotal,
        };

        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.textContent = 'Placing Order...';

        const sendAdminEmail = emailjs.send(EMAILJS_SERVICE_ID, ADMIN_TEMPLATE_ID, templateParams);
        const sendCustomerEmail = emailjs.send(EMAILJS_SERVICE_ID, CUSTOMER_TEMPLATE_ID, templateParams);

        Promise.all([sendAdminEmail, sendCustomerEmail])
            .then(function(responses) {
               console.log('SUCCESS! Both emails sent.', responses);
               paymentModal.style.display = 'none';
               thankYouModal.style.display = 'block';
               cart = {};
               renderProducts();
               updateCartUI();
               checkoutForm.reset();
            }, function(error) {
               console.log('FAILED...', error);
               alert('There was an error placing your order. Please try again or contact us directly.');
            })
            .finally(function() {
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.textContent = 'I Have Completed the Payment';
            });
    }

    // --- EVENT LISTENERS (Updated for Variants) ---
    
    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-details')) {
            const productId = e.target.dataset.productId;
            openProductModal(productId);
        }
    });

    productModal.querySelector('#modal-add-to-cart').addEventListener('click', (e) => {
        const selectedVariantId = e.target.dataset.selectedVariantId;
        if (selectedVariantId) {
            updateCart(selectedVariantId, 1);
            productModal.style.display = 'none';
        }
    });
    
    // --- UPDATED CART EVENT LISTENER ---
    cartItemsContainer.addEventListener('click', (e) => {
        const variantId = e.target.dataset.variantId;
        if (!variantId) return;
    
        if (e.target.classList.contains('remove-from-cart-btn')) {
            // If 'Remove' is clicked, remove all quantities of that item
            if (cart[variantId]) {
                updateCart(variantId, -cart[variantId].quantity);
            }
        } else if (e.target.classList.contains('cart-increase')) {
            // If '+' is clicked, add one
            updateCart(variantId, 1);
        } else if (e.target.classList.contains('cart-decrease')) {
            // If '-' is clicked, remove one
            updateCart(variantId, -1);
        }
    });

    // --- Other Listeners (No changes needed) ---
    cartIcon.addEventListener('click', () => cartDrawer.classList.toggle('is-open'));
    closeButtons.forEach(btn => {
        const modalToClose = btn.closest('.modal, .checkout-modal, .cart-drawer');
        if (modalToClose) {
            btn.addEventListener('click', () => {
                if(modalToClose.classList.contains('cart-drawer')) {
                    modalToClose.classList.remove('is-open');
                } else {
                    modalToClose.style.display = 'none';
                }
            });
        }
    });
    checkoutBtn.addEventListener('click', () => {
        if (Object.keys(cart).length > 0) {
            cartDrawer.classList.remove('is-open');
            checkoutModal.style.display = 'block';
        }
    });
    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Assuming validateForm function exists and works
        // if (validateForm()) { ... }
        checkoutModal.style.display = 'none';
        paymentModal.style.display = 'block';
    });
    confirmPaymentBtn.addEventListener('click', sendOrderEmail);
    
    // --- INITIALIZATION ---
    renderProducts();
    updateCartUI();
});
