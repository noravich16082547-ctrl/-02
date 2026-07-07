// admin.js - Back-office Dashboard & Management Logic

document.addEventListener('DOMContentLoaded', () => {
  // DB layer instance shortcut
  const DB = window.RestaurantDB;

  // ----------------------------------------------------
  // ACCESS CONTROL / AUTHENTICATION CHECK
  // ----------------------------------------------------
  const loggedInStaff = sessionStorage.getItem('loggedInStaff');
  if (!loggedInStaff) {
    window.location.href = 'login.html';
    return;
  }

  const currentStaff = JSON.parse(loggedInStaff);
  document.getElementById('staff-name').textContent = currentStaff.name || currentStaff.username;
  document.getElementById('staff-role').textContent = `บทบาท: ${currentStaff.role === 'admin' ? 'ผู้จัดการร้าน' : 'พนักงานบริการ'}`;

  // Hide Staff section if not admin
  if (currentStaff.role !== 'admin') {
    const staffNav = document.getElementById('staff-nav-menu');
    if (staffNav) staffNav.style.display = 'none';
  }

  // ----------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------
  let allOrders = [];
  let allBookings = [];
  let allDishes = [];
  let allStaffs = [];

  // Sidebar navigation mapping
  const sectionMeta = {
    'dashboard-section': { title: 'แผงควบคุม (Dashboard)', desc: 'ภาพรวมยอดขายและสถิติต่างๆ ในวันนี้' },
    'orders-section': { title: 'จัดการออเดอร์ (Orders)', desc: 'ตรวจสอบ จัดเตรียม และอัปเดตสถานะออเดอร์ของลูกค้า' },
    'bookings-section': { title: 'จัดการจองโต๊ะ (Bookings)', desc: 'รายชื่อลูกค้าที่ทำการจองโต๊ะออนไลน์ล่วงหน้า' },
    'menu-section': { title: 'จัดการเมนูอาหาร (Menu Items)', desc: 'เพิ่ม แก้ไข ลบ เมนูอาหาร และเปิด-ปิดสถานะของเมนู' },
    'staff-section': { title: 'จัดการพนักงาน (Staff Management)', desc: 'ตั้งค่าสิทธิ์ บัญชีรายชื่อของพนักงานในร้าน' },
    'settings-section': { title: 'ตั้งค่าฐานข้อมูล (Settings)', desc: 'เปลี่ยนผ่านฐานข้อมูลเพื่อขึ้นระบบใช้งานจริง' }
  };

  // DOM Elements - Sections
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('.admin-content-section');
  const sectionTitle = document.getElementById('admin-section-title');
  const sectionDesc = document.getElementById('admin-section-desc');

  // DOM Elements - Modals
  const dishModal = document.getElementById('dish-modal');
  const dishModalBackdrop = document.getElementById('dish-modal-backdrop');
  const dishForm = document.getElementById('dish-form');
  const dishModalTitle = document.getElementById('dish-modal-title');

  const staffModal = document.getElementById('staff-modal');
  const staffModalBackdrop = document.getElementById('staff-modal-backdrop');
  const staffForm = document.getElementById('staff-form');
  const staffModalTitle = document.getElementById('staff-modal-title');

  const receiptModal = document.getElementById('receipt-modal');
  const receiptModalBackdrop = document.getElementById('receipt-modal-backdrop');

  // ----------------------------------------------------
  // SIDEBAR SWITCH SECTION LOGIC
  // ----------------------------------------------------
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetSection = e.currentTarget.dataset.section;
      
      // Safety check for staff role trying to access staff section
      if (targetSection === 'staff-section' && currentStaff.role !== 'admin') {
        showToast('คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้', 'error');
        return;
      }

      // Toggle Active navigation
      navItems.forEach(nav => nav.classList.remove('active'));
      e.currentTarget.classList.add('active');

      // Toggle Visible content section
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(targetSection).classList.add('active');

      // Update Section Header metadata
      sectionTitle.textContent = sectionMeta[targetSection].title;
      sectionDesc.textContent = sectionMeta[targetSection].desc;

      // Fetch fresh section data
      refreshSectionData(targetSection);
    });
  });

  // Database Indicator
  function updateDBIndicator() {
    const config = window.getDBConfig();
    const ind = document.getElementById('db-mode-indicator');
    if (config.useSupabase) {
      ind.innerHTML = `<i class="fa-solid fa-cloud" style="color:var(--success)"></i> Database: Supabase`;
    } else {
      ind.innerHTML = `<i class="fa-solid fa-database"></i> Database: LocalStorage`;
    }
  }

  // Refresh dynamic section details
  async function refreshSectionData(sectionId) {
    updateDBIndicator();
    switch (sectionId) {
      case 'dashboard-section':
        await loadDashboardData();
        break;
      case 'orders-section':
        await loadOrdersData();
        break;
      case 'bookings-section':
        await loadBookingsData();
        break;
      case 'menu-section':
        await loadMenuData();
        break;
      case 'staff-section':
        await loadStaffsData();
        break;
      case 'settings-section':
        loadSettingsData();
        break;
    }
  }

  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('loggedInStaff');
    window.location.href = 'login.html';
  });

  // ----------------------------------------------------
  // 1. DASHBOARD LOAD LOGIC
  // ----------------------------------------------------
  async function loadDashboardData() {
    try {
      allOrders = await DB.getOrders();
      allBookings = await DB.getBookings();
      allDishes = await DB.getDishes();
      
      // Calculations
      const completedOrders = allOrders.filter(o => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      
      // Update Metrics UI
      document.getElementById('stat-revenue').textContent = `${totalRevenue.toFixed(2)} ฿`;
      document.getElementById('stat-orders-count').textContent = `${allOrders.length} ออเดอร์`;
      document.getElementById('stat-bookings-count').textContent = `${allBookings.filter(b => b.status === 'pending').length} รายการ`;
      document.getElementById('stat-dishes-count').textContent = `${allDishes.length} รายการ`;

      // Render top 5 recent orders table
      const recentOrders = allOrders.slice(0, 5);
      const recentTable = document.getElementById('recent-orders-table');
      
      if (recentOrders.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">ไม่มีรายการออเดอร์ล่าสุด</td></tr>`;
        return;
      }

      recentTable.innerHTML = recentOrders.map(order => {
        const orderTypeTxt = order.order_type === 'dine-in' ? 'ทานในร้าน 🍽️' : 'กลับบ้าน 🥡';
        const formattedDate = new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        
        let badgeClass = 'status-pending';
        let statusText = 'รอดำเนินการ';
        if (order.status === 'preparing') { badgeClass = 'status-preparing'; statusText = 'กำลังปรุง'; }
        if (order.status === 'completed') { badgeClass = 'status-completed'; statusText = 'เสร็จสิ้น'; }
        if (order.status === 'cancelled') { badgeClass = 'status-cancelled'; statusText = 'ยกเลิก'; }

        return `
          <tr>
            <td style="font-family:monospace; font-weight:700;">#${order.id.toString().substring(0, 8)}</td>
            <td>${formattedDate}</td>
            <td>${order.customer_name}</td>
            <td>${orderTypeTxt}</td>
            <td style="font-weight:700; color:var(--primary);">${parseFloat(order.total_amount).toFixed(2)} ฿</td>
            <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ', 'error');
    }
  }

  // ----------------------------------------------------
  // 2. ORDERS MANAGEMENT LOGIC
  // ----------------------------------------------------
  const filterOrderStatus = document.getElementById('filter-order-status');
  const filterOrderType = document.getElementById('filter-order-type');

  filterOrderStatus.addEventListener('change', loadOrdersData);
  filterOrderType.addEventListener('change', loadOrdersData);

  async function loadOrdersData() {
    try {
      allOrders = await DB.getOrders();
      const ordersTable = document.getElementById('orders-list-table');
      
      const statusFilterVal = filterOrderStatus.value;
      const typeFilterVal = filterOrderType.value;

      const filteredOrders = allOrders.filter(order => {
        if (statusFilterVal !== 'all' && order.status !== statusFilterVal) return false;
        if (typeFilterVal !== 'all' && order.order_type !== typeFilterVal) return false;
        return true;
      });

      if (filteredOrders.length === 0) {
        ordersTable.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:var(--text-muted);">ไม่พบข้อมูลรายการสั่งซื้อตามตัวกรอง</td></tr>`;
        return;
      }

      ordersTable.innerHTML = filteredOrders.map(order => {
        const orderTypeTxt = order.order_type === 'dine-in' ? 'ทานในร้าน 🍽️' : 'กลับบ้าน 🥡';
        const formattedDate = new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        
        // Loop order items
        const itemsList = order.order_items.map(item => `- ${item.dish_name} (x${item.quantity})`).join('<br>');

        return `
          <tr>
            <td style="font-family:monospace; font-weight:700;">#${order.id.toString().substring(0, 8)}</td>
            <td style="font-size:0.85rem">${formattedDate}</td>
            <td>
              <div style="font-weight:600">${order.customer_name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-phone"></i> ${order.customer_phone}</div>
            </td>
            <td style="font-size:0.85rem; max-width:240px; line-height:1.4">${itemsList}</td>
            <td style="font-weight:700;">${order.table_number || '-'}</td>
            <td style="font-weight:700; color:var(--primary);">${parseFloat(order.total_amount).toFixed(2)} ฿</td>
            <td>
              <select class="order-status-select" data-id="${order.id}" style="padding: 6px; border-radius: var(--radius-sm); border: 1px solid var(--border); outline:none;">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>รอดำเนินการ</option>
                <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>กำลังปรุง</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>เสร็จสิ้น</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
              </select>
            </td>
            <td class="admin-action-btns">
              <button class="admin-action-btn admin-action-print print-order-receipt-btn" data-id="${order.id}" title="พิมพ์ใบเสร็จ">
                <i class="fa-solid fa-print fa-lg"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Attach Status selector listener
      document.querySelectorAll('.order-status-select').forEach(sel => {
        sel.addEventListener('change', async (e) => {
          const orderId = e.target.dataset.id;
          const newStatus = e.target.value;
          try {
            await DB.updateOrderStatus(orderId, newStatus);
            showToast('อัปเดตสถานะออเดอร์เรียบร้อยแล้ว', 'success');
            // Refresh counts
            await loadDashboardData();
          } catch(err) {
            console.error(err);
            showToast('ไม่สามารถอัปเดตสถานะได้', 'error');
          }
        });
      });

      // Attach print receipt button listener
      document.querySelectorAll('.print-order-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const orderId = e.currentTarget.dataset.id;
          openReceiptPreview(orderId);
        });
      });

    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดรายการออเดอร์', 'error');
    }
  }

  // ----------------------------------------------------
  // 3. BOOKINGS MANAGEMENT LOGIC
  // ----------------------------------------------------
  const filterBookingStatus = document.getElementById('filter-booking-status');
  filterBookingStatus.addEventListener('change', loadBookingsData);

  async function loadBookingsData() {
    try {
      allBookings = await DB.getBookings();
      const bookingsTable = document.getElementById('bookings-list-table');
      
      const statusFilterVal = filterBookingStatus.value;
      const filteredBookings = allBookings.filter(b => {
        if (statusFilterVal !== 'all' && b.status !== statusFilterVal) return false;
        return true;
      });

      if (filteredBookings.length === 0) {
        bookingsTable.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:var(--text-muted);">ไม่พบรายการจองโต๊ะตามตัวกรอง</td></tr>`;
        return;
      }

      bookingsTable.innerHTML = filteredBookings.map(b => {
        let badgeClass = 'status-pending';
        let statusText = 'รอดำเนินการ';
        if (b.status === 'confirmed') { badgeClass = 'status-completed'; statusText = 'ยืนยันแล้ว'; }
        if (b.status === 'cancelled') { badgeClass = 'status-cancelled'; statusText = 'ยกเลิก'; }

        // Render Action buttons based on status
        let actionsHTML = '';
        if (b.status === 'pending') {
          actionsHTML = `
            <button class="btn btn-primary booking-confirm-btn" data-id="${b.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm);">
              <i class="fa-solid fa-check"></i> ยืนยัน
            </button>
            <button class="btn btn-outline booking-cancel-btn" data-id="${b.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); border-color:var(--danger); color:var(--danger)">
              <i class="fa-solid fa-xmark"></i> ยกเลิก
            </button>
          `;
        } else {
          actionsHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">ดำเนินการเสร็จสิ้น</span>`;
        }

        return `
          <tr>
            <td><strong>${b.booking_date}</strong></td>
            <td><strong>${b.booking_time} น.</strong></td>
            <td>${b.customer_name}</td>
            <td>${b.customer_phone}</td>
            <td style="font-weight:700">${b.guests} ท่าน</td>
            <td style="font-size:0.85rem; max-width:200px; color:var(--text-muted);">${b.special_requests || '-'}</td>
            <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
            <td style="display:flex; gap:8px;">${actionsHTML}</td>
          </tr>
        `;
      }).join('');

      // Listeners
      document.querySelectorAll('.booking-confirm-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          await updateBooking(id, 'confirmed');
        });
      });

      document.querySelectorAll('.booking-cancel-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          await updateBooking(id, 'cancelled');
        });
      });

    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดรายการจองโต๊ะ', 'error');
    }
  }

  async function updateBooking(bookingId, status) {
    try {
      await DB.updateBookingStatus(bookingId, status);
      showToast(`อัปเดตการจองเป็น "${status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิก'}" เรียบร้อย`, 'success');
      await loadBookingsData();
    } catch(err) {
      console.error(err);
      showToast('ไม่สามารถอัปเดตสถานะการจองได้', 'error');
    }
  }

  // ----------------------------------------------------
  // 4. MENU ITEMS MANAGEMENT LOGIC
  // ----------------------------------------------------
  async function loadMenuData() {
    try {
      allDishes = await DB.getDishes();
      const dishesTable = document.getElementById('dishes-list-table');

      dishesTable.innerHTML = allDishes.map(dish => {
        // Tag symbols
        let tags = [];
        if (dish.spicy) tags.push('🌶️ เผ็ด');
        if (dish.nuts) tags.push('🥜 ถั่ว');
        if (dish.vegetarian) tags.push('🥬 เจ');
        const tagsStr = tags.join(', ') || '-';

        return `
          <tr data-id="${dish.id}">
            <td>
              <img src="${dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200'}" alt="${dish.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); border:1px solid var(--border);">
            </td>
            <td><strong>${dish.name}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${dish.description ? dish.description.substring(0, 45) + '...' : ''}</span></td>
            <td>${dish.category}</td>
            <td style="font-weight:700; color:var(--primary)">${parseFloat(dish.price).toFixed(2)} ฿</td>
            <td style="font-size:0.85rem">${tagsStr}</td>
            <td>
              <label style="cursor:pointer;">
                <input type="checkbox" class="dish-toggle-available" data-id="${dish.id}" ${dish.available ? 'checked' : ''} style="width:18px; height:18px;">
              </label>
            </td>
            <td class="admin-action-btns">
              <button class="admin-action-btn admin-action-edit edit-dish-trigger" data-id="${dish.id}" title="แก้ไขเมนู">
                <i class="fa-solid fa-pen-to-square fa-lg"></i>
              </button>
              <button class="admin-action-btn admin-action-delete delete-dish-trigger" data-id="${dish.id}" title="ลบเมนู">
                <i class="fa-solid fa-trash fa-lg"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Add Toggle Available listener
      document.querySelectorAll('.dish-toggle-available').forEach(chk => {
        chk.addEventListener('change', async (e) => {
          const id = e.target.dataset.id;
          const checked = e.target.checked;
          const dish = allDishes.find(d => d.id === id);
          if (dish) {
            dish.available = checked;
            try {
              await DB.saveDish(dish);
              showToast(`อัปเดตสถานะพร้อมเสิร์ฟเมนู "${dish.name}" แล้ว`, 'success');
            } catch(e) {
              showToast('ไม่สามารถเปลี่ยนสถานะเมนูอาหารได้', 'error');
            }
          }
        });
      });

      // Edit Dish Trigger
      document.querySelectorAll('.edit-dish-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          openDishFormModal(id);
        });
      });

      // Delete Dish Trigger
      document.querySelectorAll('.delete-dish-trigger').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const dish = allDishes.find(d => d.id === id);
          if (dish && confirm(`ต้องการลบเมนู "${dish.name}" หรือไม่?`)) {
            try {
              await DB.deleteDish(id);
              showToast('ลบรายการเมนูสำเร็จ', 'success');
              await loadMenuData();
            } catch(e) {
              showToast('ลบเมนูไม่สำเร็จ', 'error');
            }
          }
        });
      });

    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดรายการอาหาร', 'error');
    }
  }

  // Add Dish Trigger Modal
  document.getElementById('add-dish-btn').addEventListener('click', () => {
    openDishFormModal(null);
  });

  function openDishFormModal(dishId = null) {
    dishForm.reset();
    document.getElementById('dish-id').value = '';
    
    if (dishId) {
      const dish = allDishes.find(d => d.id === dishId);
      if (dish) {
        dishModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขเมนูอาหาร`;
        document.getElementById('dish-id').value = dish.id;
        document.getElementById('dish-name').value = dish.name;
        document.getElementById('dish-category').value = dish.category;
        document.getElementById('dish-price').value = dish.price;
        document.getElementById('dish-desc').value = dish.description || '';
        document.getElementById('dish-img').value = dish.image_url || '';
        document.getElementById('dish-spicy').checked = dish.spicy || false;
        document.getElementById('dish-nuts').checked = dish.nuts || false;
        document.getElementById('dish-veg').checked = dish.vegetarian || false;
        document.getElementById('dish-available').checked = dish.available !== false;
      }
    } else {
      dishModalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> เพิ่มเมนูอาหารใหม่`;
    }

    dishModal.classList.add('show');
    dishModalBackdrop.classList.add('show');
  }

  const closeDishModal = () => {
    dishModal.classList.remove('show');
    dishModalBackdrop.classList.remove('show');
  };

  document.getElementById('dish-modal-close-btn').addEventListener('click', closeDishModal);
  dishModalBackdrop.addEventListener('click', closeDishModal);

  // Submit Add/Edit Dish
  dishForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('dish-id').value || null;
    const name = document.getElementById('dish-name').value.trim();
    const category = document.getElementById('dish-category').value;
    const price = parseFloat(document.getElementById('dish-price').value);
    const desc = document.getElementById('dish-desc').value.trim();
    const img = document.getElementById('dish-img').value.trim();
    const spicy = document.getElementById('dish-spicy').checked;
    const nuts = document.getElementById('dish-nuts').checked;
    const veg = document.getElementById('dish-veg').checked;
    const available = document.getElementById('dish-available').checked;

    const dishData = {
      name,
      category,
      price,
      description: desc,
      image_url: img,
      spicy,
      nuts,
      vegetarian: veg,
      available
    };

    if (id) {
      dishData.id = id;
    }

    try {
      await DB.saveDish(dishData);
      showToast('บันทึกเมนูอาหารเรียบร้อยแล้ว', 'success');
      closeDishModal();
      await loadMenuData();
    } catch(err) {
      console.error(err);
      showToast('ไม่สามารถบันทึกเมนูอาหารได้', 'error');
    }
  });

  // ----------------------------------------------------
  // 5. STAFFS MANAGEMENT LOGIC (ADMIN ONLY)
  // ----------------------------------------------------
  async function loadStaffsData() {
    if (currentStaff.role !== 'admin') return;

    try {
      allStaffs = await DB.getStaff();
      const staffTable = document.getElementById('staffs-list-table');

      staffTable.innerHTML = allStaffs.map(staff => {
        const roleTxt = staff.role === 'admin' ? 'ผู้จัดการร้าน (Admin) 👑' : 'พนักงานบริการ (Staff) 🧑‍🍳';
        // prevent admin deleting themselves
        const isSelf = staff.username === currentStaff.username;
        const deleteBtnHTML = isSelf 
          ? `<span style="font-size:0.75rem; color:var(--text-muted)">บัญชีปัจจุบัน</span>`
          : `<button class="admin-action-btn admin-action-delete delete-staff-trigger" data-id="${staff.id}" title="ลบพนักงาน"><i class="fa-solid fa-trash fa-lg"></i></button>`;

        return `
          <tr>
            <td><strong>${staff.name}</strong></td>
            <td>${staff.username}</td>
            <td>${roleTxt}</td>
            <td class="admin-action-btns">
              <button class="admin-action-btn admin-action-edit edit-staff-trigger" data-id="${staff.id}" title="แก้ไขพนักงาน">
                <i class="fa-solid fa-user-pen fa-lg"></i>
              </button>
              ${deleteBtnHTML}
            </td>
          </tr>
        `;
      }).join('');

      // Edit Staff
      document.querySelectorAll('.edit-staff-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          openStaffFormModal(id);
        });
      });

      // Delete Staff
      document.querySelectorAll('.delete-staff-trigger').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const staff = allStaffs.find(s => s.id === id);
          if (staff && confirm(`ต้องการลบบัญชีพนักงาน "${staff.name}" หรือไม่?`)) {
            try {
              await DB.deleteStaff(id);
              showToast('ลบพนักงานในระบบสำเร็จ', 'success');
              await loadStaffsData();
            } catch(e) {
              showToast('ลบข้อมูลไม่สำเร็จ', 'error');
            }
          }
        });
      });

    } catch(err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน', 'error');
    }
  }

  // Open Staff Modal
  document.getElementById('add-staff-btn').addEventListener('click', () => {
    openStaffFormModal(null);
  });

  function openStaffFormModal(staffId = null) {
    staffForm.reset();
    document.getElementById('staff-form-id').value = '';

    if (staffId) {
      const staff = allStaffs.find(s => s.id === staffId);
      if (staff) {
        staffModalTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> แก้ไขบัญชีพนักงาน`;
        document.getElementById('staff-form-id').value = staff.id;
        document.getElementById('staff-form-name').value = staff.name;
        document.getElementById('staff-form-username').value = staff.username;
        document.getElementById('staff-form-role').value = staff.role;
        document.getElementById('staff-form-password').value = staff.password;
      }
    } else {
      staffModalTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> เพิ่มบัญชีพนักงานใหม่`;
    }

    staffModal.classList.add('show');
    staffModalBackdrop.classList.add('show');
  }

  const closeStaffModal = () => {
    staffModal.classList.remove('show');
    staffModalBackdrop.classList.remove('show');
  };

  document.getElementById('staff-form-close-btn').addEventListener('click', closeStaffModal);
  staffModalBackdrop.addEventListener('click', closeStaffModal);

  // Submit Staff
  staffForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('staff-form-id').value || null;
    const name = document.getElementById('staff-form-name').value.trim();
    const username = document.getElementById('staff-form-username').value.trim();
    const role = document.getElementById('staff-form-role').value;
    const password = document.getElementById('staff-form-password').value;

    const staffData = { name, username, role, password };
    if (id) staffData.id = id;

    try {
      await DB.saveStaff(staffData);
      showToast('บันทึกข้อมูลพนักงานเรียบร้อยแล้ว', 'success');
      closeStaffModal();
      await loadStaffsData();
    } catch(err) {
      console.error(err);
      showToast('ไม่สามารถบันทึกข้อมูลพนักงานได้ (ชื่อผู้ใช้อาจจะซ้ำกัน)', 'error');
    }
  });

  // ----------------------------------------------------
  // 6. DB CONNECTION SETTINGS LOGIC
  // ----------------------------------------------------
  const dbConfigForm = document.getElementById('db-config-form');
  const useSupabaseChk = document.getElementById('use-supabase');
  const supabaseInputs = document.getElementById('supabase-inputs');

  useSupabaseChk.addEventListener('change', () => {
    if (useSupabaseChk.checked) {
      supabaseInputs.style.display = 'block';
      document.getElementById('db-url').required = true;
      document.getElementById('db-anon-key').required = true;
    } else {
      supabaseInputs.style.display = 'none';
      document.getElementById('db-url').required = false;
      document.getElementById('db-anon-key').required = false;
    }
  });

  function loadSettingsData() {
    const config = window.getDBConfig();
    useSupabaseChk.checked = config.useSupabase;
    document.getElementById('db-url').value = config.url || '';
    document.getElementById('db-anon-key').value = config.anonKey || '';

    // Trigger toggle visibility logic
    if (config.useSupabase) {
      supabaseInputs.style.display = 'block';
    } else {
      supabaseInputs.style.display = 'none';
    }
  }

  dbConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const checked = useSupabaseChk.checked;
    const url = document.getElementById('db-url').value.trim();
    const key = document.getElementById('db-anon-key').value.trim();

    try {
      window.saveDBConfig(url, key, checked);
      showToast('บันทึกการตั้งค่าดาต้าเบสแล้ว! กำลังรีโหลดหน้าเว็บเพื่อเริ่มต้นการเชื่อมต่อ...', 'success');
      
      // Reload in 2 seconds to initialize connection
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch(err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลตั้งค่า', 'error');
    }
  });

  // ----------------------------------------------------
  // 7. PRINTABLE INVOICE / RECEIPT GENERATION LOGIC
  // ----------------------------------------------------
  const receiptItemsList = document.getElementById('receipt-items-list');

  function openReceiptPreview(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    // Fill invoice details
    document.getElementById('receipt-order-id').textContent = `#${order.id.toString().substring(0, 16)}`;
    const dateStr = new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    document.getElementById('receipt-date').textContent = dateStr;
    document.getElementById('receipt-customer-name').textContent = order.customer_name;
    document.getElementById('receipt-type').textContent = order.order_type === 'dine-in' ? `ทานในร้าน (${order.table_number})` : 'สั่งกลับบ้าน / เดลิเวอรี';

    // Item loop
    receiptItemsList.innerHTML = order.order_items.map(item => `
      <div class="receipt-item-row">
        <span>${item.dish_name}</span>
        <span class="receipt-item-qty">x${item.quantity}</span>
        <span class="receipt-item-price">${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    // Totals calculations
    const subtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.07;
    const total = subtotal + vat;

    document.getElementById('receipt-subtotal').textContent = `${subtotal.toFixed(2)} ฿`;
    document.getElementById('receipt-vat').textContent = `${vat.toFixed(2)} ฿`;
    document.getElementById('receipt-total').textContent = `${total.toFixed(2)} ฿`;

    // Open Modal
    receiptModal.classList.add('show');
    receiptModalBackdrop.classList.add('show');
  }

  const closeReceiptModal = () => {
    receiptModal.classList.remove('show');
    receiptModalBackdrop.classList.remove('show');
  };

  document.getElementById('receipt-modal-close-btn').addEventListener('click', closeReceiptModal);
  document.getElementById('receipt-cancel-btn').addEventListener('click', closeReceiptModal);
  receiptModalBackdrop.addEventListener('click', closeReceiptModal);

  // Trigger native browser print on click
  document.getElementById('receipt-print-btn').addEventListener('click', () => {
    window.print();
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

    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // ----------------------------------------------------
  // INITIAL RUN
  // ----------------------------------------------------
  refreshSectionData('dashboard-section');
});
