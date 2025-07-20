document.addEventListener('DOMContentLoaded', () => {

    // --- YOUR EMAILJS KEYS ARE INTEGRATED HERE ---
    const EMAILJS_PUBLIC_KEY = 'jFuguvov1fb98PedB';
    const EMAILJS_SERVICE_ID = 'service_b6b6adn';
    // Correctly named the variable for the admin template
    const ADMIN_TEMPLATE_ID = 'template_4fggr58'; 
    const CUSTOMER_TEMPLATE_ID = 'template_wy48qy6';
    
    // Initialize EmailJS with your Public Key
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // --- PRODUCT DATA (with corrected image paths) ---
    const products = {
        'red-chilli': { name: 'Red Chilli Powder', image: 'images/product2.jpg', price: 120, description: 'Sourced from the finest farms...' },
        'turmeric': { name: 'Pure Turmeric Powder', image: 'images/product2.jpg', price: 90, description: 'Known as "Indian Saffron"...' },
        'coriander': { name: 'Coriander Powder', image: 'images/product2.jpg', price: 85, description: 'Made from premium quality...' },
        'atta': { name: 'Whole Wheat Atta', image: 'images/product2.jpg', price: 150, description: 'Our Atta is made from 100% whole wheat grains...' },
        'hing': { name: 'Asafoetida (Hing)', image: 'images/product2.jpg', price: 250, description: 'A powerful and pungent spice...' },
        'garam-masala': { name: 'Garam Masala', image: 'images/product2.jpg', price: 180, description: 'A classic blend of aromatic spices...' },
        'cumin-seeds': { name: 'Cumin Seeds', image: 'images/product2.jpg', price: 110, description: 'Whole cumin seeds with an earthy, nutty flavor...' },
        'black-pepper': { name: 'Black Pepper', image: 'images/product2.jpg', price: 200, description: 'Freshly ground black pepper...' }
    };

    // --- ELEMENTS ---
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

    // --- RENDER & LOGIC FUNCTIONS ---
    function renderProducts() {
        productGrid.innerHTML = '';
        for (const productId in products) {
            const product = products[productId];
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = productId;
            const isInCart = cart.hasOwnProperty(productId);
            const quantity = isInCart ? cart[productId].quantity : 0;
            let footerHtml = isInCart
                ? `<div class="quantity-control"><button class="quantity-btn quantity-decrease" data-product-id="${productId}">-</button><span class="quantity-display">${quantity}</span><button class="quantity-btn quantity-increase" data-product-id="${productId}">+</button></div>`
                : `<button class="btn-details" data-product-id="${productId}">View Details</button>`;
            card.innerHTML = `<img src="${product.image}" alt="${product.name}"><h3>${product.name}</h3><p class="product-price">₹${product.price.toFixed(2)}</p><div class="product-card-footer">${footerHtml}</div>`;
            productGrid.appendChild(card);
        }
    }
    
    function updateCart(productId, change) {
        if (!cart[productId] && change > 0) {
            cart[productId] = { ...products[productId], quantity: 1 };
        } else if (cart[productId]) {
            cart[productId].quantity += change;
            if (cart[productId].quantity <= 0) {
                delete cart[productId];
            }
        }
        renderProducts();
        updateCartUI();
    }

    function showPlusOneAnimation(productId) {
        const card = productGrid.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (card) {
            const plusOne = document.createElement('span');
            plusOne.textContent = '+1';
            plusOne.className = 'plus-one-anim';
            card.appendChild(plusOne);
            setTimeout(() => { plusOne.remove(); }, 1000);
        }
    }
    
    function updateCartUI() {
        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
            checkoutBtn.disabled = true;
        } else {
            cartItemsContainer.innerHTML = '';
            checkoutBtn.disabled = false;
            for (const productId in cart) {
                const item = cart[productId];
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `<img src="${item.image}" alt="${item.name}" class="cart-item-img"><div class="cart-item-details"><h4>${item.name}</h4><p class="cart-item-price">₹${item.price.toFixed(2)} x ${item.quantity}</p></div><button class="remove-from-cart-btn" data-product-id="${productId}">✖</button>`;
                cartItemsContainer.appendChild(itemEl);
            }
        }
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCountSpan.textContent = totalItems;
        cartTotalPriceSpan.textContent = `₹${totalPrice.toFixed(2)}`;
        document.getElementById('payment-amount').textContent = `₹${totalPrice.toFixed(2)}`;
        document.getElementById('checkout-total-price').textContent = `₹${totalPrice.toFixed(2)}`;
    }

    function openProductModal(productId) {
        const product = products[productId];
        productModal.querySelector('#modal-img').src = product.image;
        productModal.querySelector('#modal-title').textContent = product.name;
        productModal.querySelector('#modal-description').textContent = product.description;
        productModal.querySelector('#modal-add-to-cart').dataset.productId = productId;
        productModal.style.display = 'block';
    }

    function validateForm() {
        let isValid = true;
        checkoutForm.querySelectorAll('input[required]').forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return isValid;
    }

    // --- CORRECTED EMAIL SENDING FUNCTION ---
    function sendOrderEmail() {
        const orderItemsHtml = Object.values(cart).map(item => 
            `<p style="margin: 5px 0;">${item.name} (x${item.quantity}) - <strong>₹${(item.price * item.quantity).toFixed(2)}</strong></p>`
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

        // This is the correct logic using Promise.all to send both emails.
        const sendAdminEmail = emailjs.send(EMAILJS_SERVICE_ID, ADMIN_TEMPLATE_ID, templateParams);
        const sendCustomerEmail = emailjs.send(EMAILJS_SERVICE_ID, CUSTOMER_TEMPLATE_ID, templateParams);

        Promise.all([sendAdminEmail, sendCustomerEmail])
            .then(function(responses) {
               console.log('SUCCESS! Both emails sent.', responses);
               paymentModal.style.display = 'none';
               thankYouModal.style.display = 'block';
               // Reset the application state
               cart = {};
               renderProducts();
               updateCartUI();
               checkoutForm.reset();
            }, function(error) {
               console.log('FAILED...', error);
               alert('There was an error placing your order. Please try again or contact us directly.');
            })
            .finally(function() {
                // This re-enables the button whether the email succeeded or failed
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.textContent = 'I Have Completed the Payment';
            });
        
        // THE DUPLICATE CODE BLOCK THAT WAS HERE HAS BEEN REMOVED.
    }

    // --- EVENT LISTENERS ---
    
    productGrid.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        if (!productId) return;
        if (e.target.classList.contains('quantity-increase')) {
            updateCart(productId, 1);
            showPlusOneAnimation(productId);
        } else if (e.target.classList.contains('quantity-decrease')) {
            updateCart(productId, -1);
        } else if (e.target.classList.contains('btn-details')) {
            openProductModal(productId);
        }
    });

    productModal.querySelector('#modal-add-to-cart').addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        updateCart(productId, 1);
        showPlusOneAnimation(productId);
        productModal.style.display = 'none';
    });
    
    cartIcon.addEventListener('click', () => cartDrawer.classList.toggle('is-open'));

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const productId = e.target.dataset.productId;
            if (cart[productId]) {
                updateCart(productId, -cart[productId].quantity);
            }
        }
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalToClose = btn.closest('.modal, .checkout-modal, .cart-drawer');
            if(modalToClose) {
                if(modalToClose.classList.contains('cart-drawer')) {
                    modalToClose.classList.remove('is-open');
                } else {
                    modalToClose.style.display = 'none';
                }
            }
        });
    });

    checkoutBtn.addEventListener('click', () => {
        if (Object.keys(cart).length > 0) {
            cartDrawer.classList.remove('is-open');
            checkoutModal.style.display = 'block';
        }
    });

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (validateForm()) {
            checkoutModal.style.display = 'none';
            paymentModal.style.display = 'block';
        } else {
            alert('Please fill out all required shipping details.');
        }
    });

    // This is the final button the user clicks, now it triggers the email function
    confirmPaymentBtn.addEventListener('click', sendOrderEmail);
    
    // --- INITIALIZATION ---
    renderProducts();
    updateCartUI();
});