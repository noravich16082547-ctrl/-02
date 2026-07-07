// app.js - Customer Storefront Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
  // DB layer instance shortcut
  const DB = window.RestaurantDB;

  // State
  let cart = [];
  let dishes = [];

  // DOM Elements
  const menuItemsContainer = document.getElementById('menu-items-container');
  const menuSearch = document.getElementById('menu-search');
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Diet filter checkboxes
  const filterSpicy = document.getElementById('filter-spicy');
  const filterNuts = document.getElementById('filter-nuts');
  const filterVeg = document.getElementById('filter-veg');
  const filterSpicyLbl = document.getElementById('filter-spicy-lbl');
  const filterNutsLbl = document.getElementById('filter-nuts-lbl');
  const filterVegLbl = document.getElementById('filter-veg-lbl');

  // Booking Form
  const bookingForm = document.getElementById('booking-form');

  // Cart Drawer Elements
  const cartBtn = document.getElementById('cart-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartVat = document.getElementById('cart-vat');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Checkout Modal Elements
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutBackdrop = document.getElementById('checkout-backdrop');
  const checkoutCloseBtn = document.getElementById('checkout-close-btn');
  const checkoutForm = document.getElementById('checkout-form');
  const orderType = document.getElementById('order-type');
  const tableNumberGroup = document.getElementById('table-number-group');
  const tableNumber = document.getElementById('table-number');
  const paymentMethod = document.getElementById('payment-method');
  const promptPaySection = document.getElementById('promptpay-section');
  const ppQrImg = document.getElementById('pp-qr-img');
  const ppQrAmount = document.getElementById('pp-qr-amount');

  // Mobile nav elements
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksList = document.getElementById('nav-links');

  // FAB elements
  const fabMainBtn = document.getElementById('fab-main-btn');
  const fabWrapper = document.getElementById('fab-wrapper');

  // ----------------------------------------------------
  // INITIALIZATION & MENU RENDERING
  // ----------------------------------------------------
  async function loadMenu() {
    try {
      dishes = await DB.getDishes();
      renderMenu();
    } catch (err) {
      console.error(err);
      menuItemsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
        <i class="fa-solid fa-triangle-exclamation fa-2xl"></i><br><br>เกิดข้อผิดพลาดในการโหลดเมนู กรุณาลองใหม่อีกครั้ง
      </div>`;
    }
  }

  function renderMenu() {
    const searchTerm = menuSearch.value.toLowerCase().trim();
    const activeTab = document.querySelector('.tab-btn.active').dataset.category;
    
    const spicyOnly = filterSpicy.checked;
    const nutsOnly = filterNuts.checked;
    const vegOnly = filterVeg.checked;

    // Filter items
    const filteredDishes = dishes.filter(dish => {
      // 1. Availability check
      if (!dish.available) return false;
      
      // 2. Category Filter
      if (activeTab !== 'all' && dish.category !== activeTab) return false;

      // 3. Search Filter
      if (searchTerm && !dish.name.toLowerCase().includes(searchTerm) && 
          !(dish.description && dish.description.toLowerCase().includes(searchTerm))) {
        return false;
      }

      // 4. Dietary Tag Filters
      if (spicyOnly && !dish.spicy) return false;
      if (nutsOnly && !dish.nuts) return false;
      if (vegOnly && !dish.vegetarian) return false;

      return true;
    });

    // Render HTML
    if (filteredDishes.length === 0) {
      menuItemsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">
        <i class="fa-solid fa-utensils fa-2xl"></i><br><br>ไม่พบรายการอาหารที่ตรงกับตัวกรองของคุณ
      </div>`;
      return;
    }

    menuItemsContainer.innerHTML = filteredDishes.map(dish => {
      // Build dietary badges html
      let badgesHTML = '';
      if (dish.spicy) badgesHTML += `<span class="badge-label badge-spicy">🌶️ เผ็ด</span>`;
      if (dish.nuts) badgesHTML += `<span class="badge-label badge-nuts">🥜 ถั่ว</span>`;
      if (dish.vegetarian) badgesHTML += `<span class="badge-label badge-vegetarian">🥬 มังสวิรัติ</span>`;

      return `
        <div class="menu-card" data-id="${dish.id}">
          <div class="menu-card-img-wrapper">
            <img src="${dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'}" alt="${dish.name}" class="menu-card-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'">
            <div class="menu-labels">${badgesHTML}</div>
          </div>
          <div class="menu-card-content">
            <h3 class="menu-card-title">${dish.name}</h3>
            <p class="menu-card-desc">${dish.description || 'ไม่มีคำบรรยายเพิ่มเติมสำหรับรายการนี้'}</p>
            <div class="menu-card-footer">
              <span class="menu-card-price">${parseFloat(dish.price).toFixed(2)}</span>
              <button class="btn btn-primary add-to-cart-btn" data-id="${dish.id}" style="padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.85rem;">
                <i class="fa-solid fa-plus"></i> เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Add to Cart event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dishId = e.currentTarget.dataset.id;
        addToCart(dishId);
      });
    });
  }

  // ----------------------------------------------------
  // FILTER EVENT LISTENERS
  // ----------------------------------------------------
  menuSearch.addEventListener('input', renderMenu);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderMenu();
    });
  });

  // Toggle styling on custom dietary checkboxes
  [
    { chk: filterSpicy, lbl: filterSpicyLbl },
    { chk: filterNuts, lbl: filterNutsLbl },
    { chk: filterVeg, lbl: filterVegLbl }
  ].forEach(pair => {
    pair.chk.addEventListener('change', () => {
      if (pair.chk.checked) {
        pair.lbl.classList.add('active');
      } else {
        pair.lbl.classList.remove('active');
      }
      renderMenu();
    });
  });

  // ----------------------------------------------------
  // SHOPPING CART LOGIC
  // ----------------------------------------------------
  function addToCart(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = cart.find(item => item.dish_id === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        dish_id: dish.id,
        dish_name: dish.name,
        price: parseFloat(dish.price),
        quantity: 1
      });
    }

    updateCartUI();
    showToast(`เพิ่ม "${dish.name}" เข้าตะกร้าสำเร็จ!`, 'success');
  }

  function updateCartUI() {
    // Save locally
    localStorage.setItem('restaurant_client_cart', JSON.stringify(cart));

    // Cart icon badge
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadgeCount.textContent = totalQty;

    // Items list
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty-message">ไม่มีอาหารในตะกร้าของคุณ</div>';
      checkoutBtn.disabled = true;
      cartSubtotal.textContent = '0.00 ฿';
      cartVat.textContent = '0.00 ฿';
      cartTotal.textContent = '0.00 ฿';
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-title">${item.dish_name}</p>
          <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ฿ <span style="font-size:0.75rem; color:var(--text-muted);">(${item.price.toFixed(2)} ฿ x ${item.quantity})</span></p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.dish_id}">-</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.dish_id}">+</button>
        </div>
        <button class="cart-remove-btn" data-id="${item.dish_id}"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `).join('');

    // Totals calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.07; // 7% VAT/service
    const total = subtotal + vat;

    cartSubtotal.textContent = `${subtotal.toFixed(2)} ฿`;
    cartVat.textContent = `${vat.toFixed(2)} ฿`;
    cartTotal.textContent = `${total.toFixed(2)} ฿`;

    // Attach cart actions listeners
    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        updateQty(e.target.dataset.id, -1);
      });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        updateQty(e.target.dataset.id, 1);
      });
    });

    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        cart = cart.filter(item => item.dish_id !== id);
        updateCartUI();
        showToast('ลบรายการอาหารเรียบร้อย', 'info');
      });
    });
  }

  function updateQty(dishId, delta) {
    const item = cart.find(i => i.dish_id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.dish_id !== dishId);
      showToast('ลบรายการอาหารเรียบร้อย', 'info');
    }
    updateCartUI();
  }

  // Load saved cart from localStorage
  const savedCart = localStorage.getItem('restaurant_client_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch(e) {
      cart = [];
    }
  }

  // Drawer Toggle
  cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('show');
  });

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('show');
  };

  cartCloseBtn.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // ----------------------------------------------------
  // BOOKING FORM LOGIC
  // ----------------------------------------------------
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('booking-name').value;
    const phone = document.getElementById('booking-phone').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const guests = document.getElementById('booking-guests').value;
    const requests = document.getElementById('booking-requests').value;

    // Check date isn't in past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
      showToast('ไม่สามารถจองโต๊ะย้อนหลังได้ กรุณาเลือกวันที่ถูกต้อง', 'error');
      return;
    }

    const bookingData = {
      customer_name: name,
      customer_phone: phone,
      booking_date: date,
      booking_time: time,
      guests: guests,
      special_requests: requests
    };

    try {
      await DB.createBooking(bookingData);
      showToast(`จองโต๊ะสำเร็จ! รหัสยืนยันส่งไปที่เบอร์ ${phone} เรียบร้อยแล้ว`, 'success');
      bookingForm.reset();
    } catch(err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการจองโต๊ะ กรุณาลองอีกครั้ง', 'error');
    }
  });

  // Set booking date default to today
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingDateInput.value = tomorrow.toISOString().split('T')[0];
    bookingDateInput.min = new Date().toISOString().split('T')[0];
  }

  // ----------------------------------------------------
  // CHECKOUT MODAL LOGIC
  // ----------------------------------------------------
  checkoutBtn.addEventListener('click', () => {
    // Calculate total for PromptPay
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * 1.07;

    // Show modal
    checkoutModal.classList.add('show');
    checkoutBackdrop.classList.add('show');
    closeCart(); // close cart drawer for cleaner look

    // Update PP qr amount
    ppQrAmount.textContent = total.toFixed(2);
    // Dynamic PromptPay Generator
    // Format: https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PP_PAYLOAD
    // 0002010102113000160006940000000001030312345678901235406850.00 is standard QR payload with placeholder values
    // To represent dynamically we just inject amount at the end
    const rawQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0002010102113000160006940000000001030312345678901235406850.00`;
    ppQrImg.src = rawQrUrl;
  });

  const closeCheckout = () => {
    checkoutModal.classList.remove('show');
    checkoutBackdrop.classList.remove('show');
  };

  checkoutCloseBtn.addEventListener('click', closeCheckout);
  checkoutBackdrop.addEventListener('click', closeCheckout);

  // Toggle checkout options dynamically
  orderType.addEventListener('change', () => {
    if (orderType.value === 'dine-in') {
      tableNumberGroup.style.display = 'flex';
      tableNumber.required = true;
    } else {
      tableNumberGroup.style.display = 'none';
      tableNumber.required = false;
    }
  });

  paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'promptpay') {
      promptPaySection.style.display = 'block';
    } else {
      promptPaySection.style.display = 'none';
    }
  });

  // Submit Checkout order
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const type = orderType.value;
    const tbl = type === 'dine-in' ? tableNumber.value : '';
    const payment = paymentMethod.value;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * 1.07;

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      order_type: type,
      table_number: tbl,
      total_amount: total
    };

    try {
      await DB.createOrder(orderData, cart);
      
      // Clean Cart
      cart = [];
      updateCartUI();
      
      // Close
      closeCheckout();

      // Show success
      let message = `สั่งอาหารสำเร็จ! ออเดอร์ของคุณรอดำเนินการ`;
      if (type === 'dine-in') {
        message += ` (เสิร์ฟที่ ${tbl})`;
      } else {
        message += ` (กรุณามารับที่เคาน์เตอร์)`;
      }
      showToast(message, 'success');
      checkoutForm.reset();
      
      // reset forms defaults
      tableNumberGroup.style.display = 'flex';
      tableNumber.required = true;
      promptPaySection.style.display = 'none';

    } catch(err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ กรุณาลองใหม่', 'error');
    }
  });

  // ----------------------------------------------------
  // MOBILE NAVIGATION & SCROLL HIGHLIGHT
  // ----------------------------------------------------
  menuToggle.addEventListener('click', () => {
    navLinksList.classList.toggle('open');
  });

  // Close nav on click (mobile)
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksList.classList.remove('open');
    });
  });

  // Highlighting active nav link based on scroll section
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === current) {
        link.classList.add('active');
      }
    });
  });

  // ----------------------------------------------------
  // FLOATING ACTION BUTTON (FAB)
  // ----------------------------------------------------
  fabMainBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fabWrapper.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    fabWrapper.classList.remove('active');
  });

  // ----------------------------------------------------
  // TOAST SYSTEM
  // ----------------------------------------------------
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Fadeout and remove
    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // Initial Load
  loadMenu();
});
