// db.js - Database Service Layer (Dual-Mode: LocalStorage & Supabase REST API)

const DB_CONFIG_KEY = 'restaurant_db_config';
const LOCAL_DISHES_KEY = 'restaurant_dishes';
const LOCAL_ORDERS_KEY = 'restaurant_orders';
const LOCAL_ORDER_ITEMS_KEY = 'restaurant_order_items';
const LOCAL_BOOKINGS_KEY = 'restaurant_bookings';
const LOCAL_STAFF_KEY = 'restaurant_staff';

// Default Menu Seed Data
const DEFAULT_DISHES = [
  {
    id: 'd1',
    name: 'ต้มยำกุ้งน้ำข้น (Tom Yum Goong)',
    price: 250.00,
    category: 'จานหลัก',
    description: 'ต้มยำกุ้งแม่น้ำรสเข้มข้น หอมเครื่องสมุนไพร ข่า ตะไคร้ ใบมะกรูด พริกเผารสจัดจ้าน',
    image_url: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: true,
    nuts: false,
    vegetarian: false
  },
  {
    id: 'd2',
    name: 'ผัดไทยกุ้งสด (Pad Thai)',
    price: 150.00,
    category: 'จานหลัก',
    description: 'เส้นจันท์เหนียวนุ่ม ผัดกับน้ำซอสมะขามสูตรโบราณ เสิร์ฟพร้อมกุ้งสดตัวโต และถั่วลิสงคั่วเอง',
    image_url: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: false,
    nuts: true,
    vegetarian: false
  },
  {
    id: 'd3',
    name: 'แกงเขียวหวานไก่ (Green Curry)',
    price: 180.00,
    category: 'จานหลัก',
    description: 'แกงเขียวหวานไก่รสเข้มข้น มะเขือเปราะกรอบหวาน ราดกะทิสด หอมกลิ่นใบโหระพา',
    image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: true,
    nuts: false,
    vegetarian: false
  },
  {
    id: 'd4',
    name: 'ส้มตำไทยไข่เค็ม (Som Tum)',
    price: 95.00,
    category: 'อาหารทานเล่น',
    description: 'ส้มตำมะละกอสดคลุกเคล้ากับถั่วลิสงคั่ว กุ้งแห้ง มะเขือเทศ และไข่เค็มมันๆ รสกลมกล่อม',
    image_url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: true,
    nuts: true,
    vegetarian: true
  },
  {
    id: 'd5',
    name: 'ปอเปี๊ยะทอดเจ (Fried Spring Rolls)',
    price: 85.00,
    category: 'อาหารทานเล่น',
    description: 'ปอเปี๊ยะทอดกรอบไส้วุ้นเส้น กะหล่ำปลี และแครอท เสิร์ฟคู่ซอสน้ำจิ้มบ๊วยหวานเจี๊ยบ',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: false,
    nuts: false,
    vegetarian: true
  },
  {
    id: 'd6',
    name: 'ข้าวเหนียวมะม่วง (Mango Sticky Rice)',
    price: 120.00,
    category: 'ของหวาน',
    description: 'ข้าวเหนียวมูนนุ่มหอมมันกะทิ เสิร์ฟพร้อมมะม่วงน้ำดอกไม้สุกรสหวานฉ่ำ ราดด้วยน้ำกะทิสดเข้มข้น',
    image_url: 'https://images.unsplash.com/photo-1608756687911-a1b54f6f5dc5?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: false,
    nuts: false,
    vegetarian: true
  },
  {
    id: 'd7',
    name: 'ชาไทยนมเย็น (Thai Milk Tea)',
    price: 60.00,
    category: 'เครื่องดื่ม',
    description: 'ชาไทยชงสดกลิ่นหอมกรุ่น ผสมนมนัวหวานมันกำลังดี เสิร์ฟเย็นชื่นใจ',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: false,
    nuts: false,
    vegetarian: false
  },
  {
    id: 'd8',
    name: 'น้ำมะพร้าวอ่อนน้ำหอม (Coconut Water)',
    price: 70.00,
    category: 'เครื่องดื่ม',
    description: 'น้ำมะพร้าวอ่อนน้ำหอมธรรมชาติ 100% สดๆ จากลูก ดับกระหายคลายร้อน',
    image_url: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?q=80&w=600&auto=format&fit=crop',
    available: true,
    spicy: false,
    nuts: false,
    vegetarian: true
  }
];

// Seed Staff
const DEFAULT_STAFF = [
  { id: 's1', username: 'admin', password: 'adminpassword', role: 'admin', name: 'ผู้จัดการร้าน' },
  { id: 's2', username: 'staff1', password: 'password123', role: 'staff', name: 'พนักงานบริการ 1' }
];

// Database configurations (Supabase URL & Anon Key)
function getDBConfig() {
  const config = localStorage.getItem(DB_CONFIG_KEY);
  return config ? JSON.parse(config) : { useSupabase: false, url: '', anonKey: '' };
}

function saveDBConfig(url, anonKey, useSupabase = true) {
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify({ useSupabase, url, anonKey }));
}

// Generate Unique IDs for LocalStorage Mode
function generateUUID() {
  return 'uuid_' + Math.random().toString(36).substr(2, 9);
}

// Helper to make fetch request to Supabase
async function supabaseFetch(path, options = {}) {
  const config = getDBConfig();
  if (!config.useSupabase || !config.url || !config.anonKey) {
    throw new Error('Supabase is not configured properly.');
  }

  const url = `${config.url}/rest/v1/${path}`;
  const headers = {
    'apikey': config.anonKey,
    'Authorization': `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  if (options.method === 'DELETE' || response.status === 204) {
    return null;
  }

  return await response.json();
}

// ==========================================
// DB SERVICE METHODS
// ==========================================
const db = {
  // Database Initializer (Run on load)
  async init() {
    // Check if localStorage has tables, if not seed them
    if (!localStorage.getItem(LOCAL_DISHES_KEY)) {
      localStorage.setItem(LOCAL_DISHES_KEY, JSON.stringify(DEFAULT_DISHES));
    }
    if (!localStorage.getItem(LOCAL_STAFF_KEY)) {
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem(LOCAL_ORDERS_KEY)) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_ORDER_ITEMS_KEY)) {
      localStorage.setItem(LOCAL_ORDER_ITEMS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_BOOKINGS_KEY)) {
      localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify([
        {
          id: 'b1',
          customer_name: 'คุณณภัทร สมบูรณ์',
          customer_phone: '0812345678',
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: '18:30',
          guests: 4,
          special_requests: 'ขอเก้าอี้สำหรับเด็กเล็ก 1 ตัว และโต๊ะริมหน้าต่าง',
          status: 'confirmed',
          created_at: new Date().toISOString()
        }
      ]));
    }
  },

  // ------------------------------------------
  // DISHES (MENU) METHODS
  // ------------------------------------------
  async getDishes() {
    const config = getDBConfig();
    if (config.useSupabase) {
      try {
        return await supabaseFetch('dishes?select=*');
      } catch (err) {
        console.error('Supabase fetch failed, falling back to LocalStorage', err);
      }
    }
    return JSON.parse(localStorage.getItem(LOCAL_DISHES_KEY)) || [];
  },

  async saveDish(dish) {
    const config = getDBConfig();
    if (config.useSupabase) {
      if (dish.id && !dish.id.startsWith('uuid_')) {
        // Update
        return await supabaseFetch(`dishes?id=eq.${dish.id}`, {
          method: 'PATCH',
          body: JSON.stringify(dish)
        });
      } else {
        // Create (Omit mock id)
        const newDish = { ...dish };
        delete newDish.id;
        return await supabaseFetch('dishes', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newDish)
        });
      }
    }

    // LocalStorage fallback
    const dishes = await this.getDishes();
    if (dish.id) {
      const idx = dishes.findIndex(d => d.id === dish.id);
      if (idx !== -1) {
        dishes[idx] = dish;
      }
    } else {
      dish.id = generateUUID();
      dishes.push(dish);
    }
    localStorage.setItem(LOCAL_DISHES_KEY, JSON.stringify(dishes));
    return dish;
  },

  async deleteDish(dishId) {
    const config = getDBConfig();
    if (config.useSupabase) {
      return await supabaseFetch(`dishes?id=eq.${dishId}`, { method: 'DELETE' });
    }

    const dishes = await this.getDishes();
    const updated = dishes.filter(d => d.id !== dishId);
    localStorage.setItem(LOCAL_DISHES_KEY, JSON.stringify(updated));
    return true;
  },

  // ------------------------------------------
  // ORDERS METHODS
  // ------------------------------------------
  async getOrders() {
    const config = getDBConfig();
    if (config.useSupabase) {
      try {
        // Fetch orders and join order items
        const orders = await supabaseFetch('orders?select=*,order_items(*)&order=created_at.desc');
        return orders;
      } catch (err) {
        console.error('Supabase fetch failed, falling back to LocalStorage', err);
      }
    }

    const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY)) || [];
    const items = JSON.parse(localStorage.getItem(LOCAL_ORDER_ITEMS_KEY)) || [];

    // Attach items to orders
    return orders.map(order => {
      return {
        ...order,
        order_items: items.filter(item => item.order_id === order.id)
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createOrder(orderData, items) {
    const config = getDBConfig();
    if (config.useSupabase) {
      // 1. Insert Order
      const resOrder = await supabaseFetch('orders', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          customer_name: orderData.customer_name,
          table_number: orderData.table_number || '',
          order_type: orderData.order_type,
          status: 'pending',
          total_amount: parseFloat(orderData.total_amount)
        })
      });

      const newOrder = resOrder[0];

      // 2. Insert Order Items
      const orderItemsToInsert = items.map(item => ({
        order_id: newOrder.id,
        dish_id: item.dish_id.startsWith('uuid_') ? null : item.dish_id, // prevent foreign key crash on mock IDs
        dish_name: item.dish_name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      }));

      await supabaseFetch('order_items', {
        method: 'POST',
        body: JSON.stringify(orderItemsToInsert)
      });

      return { ...newOrder, order_items: orderItemsToInsert };
    }

    // LocalStorage fallback
    const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY)) || [];
    const orderItems = JSON.parse(localStorage.getItem(LOCAL_ORDER_ITEMS_KEY)) || [];

    const orderId = generateUUID();
    const newOrder = {
      id: orderId,
      created_at: new Date().toISOString(),
      customer_name: orderData.customer_name,
      table_number: orderData.table_number || '',
      order_type: orderData.order_type,
      status: 'pending',
      total_amount: parseFloat(orderData.total_amount)
    };

    const newItems = items.map(item => ({
      id: generateUUID(),
      order_id: orderId,
      dish_id: item.dish_id,
      dish_name: item.dish_name,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    orders.push(newOrder);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));

    orderItems.push(...newItems);
    localStorage.setItem(LOCAL_ORDER_ITEMS_KEY, JSON.stringify(orderItems));

    return { ...newOrder, order_items: newItems };
  },

  async updateOrderStatus(orderId, status) {
    const config = getDBConfig();
    if (config.useSupabase) {
      return await supabaseFetch(`orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }

    const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY)) || [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
      return orders[idx];
    }
    return null;
  },

  // ------------------------------------------
  // BOOKINGS METHODS
  // ------------------------------------------
  async getBookings() {
    const config = getDBConfig();
    if (config.useSupabase) {
      try {
        return await supabaseFetch('bookings?select=*&order=booking_date.desc,booking_time.desc');
      } catch (err) {
        console.error('Supabase fetch failed, falling back to LocalStorage', err);
      }
    }
    const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
    return bookings.sort((a, b) => new Date(b.booking_date + 'T' + b.booking_time) - new Date(a.booking_date + 'T' + a.booking_time));
  },

  async createBooking(bookingData) {
    const config = getDBConfig();
    if (config.useSupabase) {
      const res = await supabaseFetch('bookings', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          customer_name: bookingData.customer_name,
          customer_phone: bookingData.customer_phone,
          booking_date: bookingData.booking_date,
          booking_time: bookingData.booking_time,
          guests: parseInt(bookingData.guests),
          special_requests: bookingData.special_requests || '',
          status: 'pending'
        })
      });
      return res[0];
    }

    // LocalStorage fallback
    const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
    const newBooking = {
      id: generateUUID(),
      created_at: new Date().toISOString(),
      customer_name: bookingData.customer_name,
      customer_phone: bookingData.customer_phone,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      guests: parseInt(bookingData.guests),
      special_requests: bookingData.special_requests || '',
      status: 'pending'
    };
    bookings.push(newBooking);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
  },

  async updateBookingStatus(bookingId, status) {
    const config = getDBConfig();
    if (config.useSupabase) {
      return await supabaseFetch(`bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }

    const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].status = status;
      localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
      return bookings[idx];
    }
    return null;
  },

  // ------------------------------------------
  // STAFF (AUTHENTICATION) METHODS
  // ------------------------------------------
  async loginStaff(username, password) {
    const config = getDBConfig();
    if (config.useSupabase) {
      try {
        const res = await supabaseFetch(`staff?username=eq.${username}&password=eq.${password}&select=*`);
        if (res && res.length > 0) {
          return res[0];
        }
        return null;
      } catch (err) {
        console.error('Supabase auth failed, falling back to LocalStorage', err);
      }
    }

    // LocalStorage auth
    const staffList = JSON.parse(localStorage.getItem(LOCAL_STAFF_KEY)) || [];
    const found = staffList.find(s => s.username === username && s.password === password);
    return found || null;
  },

  async getStaff() {
    const config = getDBConfig();
    if (config.useSupabase) {
      try {
        return await supabaseFetch('staff?select=*');
      } catch (err) {
        console.error(err);
      }
    }
    return JSON.parse(localStorage.getItem(LOCAL_STAFF_KEY)) || [];
  },

  async saveStaff(staffData) {
    const config = getDBConfig();
    if (config.useSupabase) {
      if (staffData.id && !staffData.id.startsWith('uuid_')) {
        return await supabaseFetch(`staff?id=eq.${staffData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(staffData)
        });
      } else {
        const newStaff = { ...staffData };
        delete newStaff.id;
        return await supabaseFetch('staff', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newStaff)
        });
      }
    }

    const staffList = JSON.parse(localStorage.getItem(LOCAL_STAFF_KEY)) || [];
    if (staffData.id) {
      const idx = staffList.findIndex(s => s.id === staffData.id);
      if (idx !== -1) {
        staffList[idx] = staffData;
      }
    } else {
      staffData.id = generateUUID();
      staffList.push(staffData);
    }
    localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(staffList));
    return staffData;
  },

  async deleteStaff(staffId) {
    const config = getDBConfig();
    if (config.useSupabase) {
      return await supabaseFetch(`staff?id=eq.${staffId}`, { method: 'DELETE' });
    }

    const staffList = JSON.parse(localStorage.getItem(LOCAL_STAFF_KEY)) || [];
    const updated = staffList.filter(s => s.id !== staffId);
    localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(updated));
    return true;
  }
};

// Initialize DB structure when script loads
db.init();

// Export to window so other scripts can access it in the browser
window.RestaurantDB = db;
window.getDBConfig = getDBConfig;
window.saveDBConfig = saveDBConfig;
