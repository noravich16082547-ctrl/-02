# Taste Harmony - Premium Restaurant Web Application

เว็บไซต์ร้านอาหารระดับพรีเมียม **"Taste Harmony" (เทสต์ ฮาร์โมนี)** รองรับการสั่งอาหารออนไลน์ผ่านหน้าเว็บ, ระบบจองโต๊ะ, หน้าโปรโมชัน, และระบบจัดการหลังร้าน (Back-office) สำหรับพนักงานในการอัปเดตสถานะออเดอร์ จัดการโต๊ะจอง จัดการเมนูอาหาร และสั่งพิมพ์ใบเสร็จรับเงินสำหรับเครื่องพิมพ์สลิปความร้อน (Thermal Printer)

โปรเจกต์นี้ได้รับการพัฒนาในรูปแบบ **Modern Static Web Application** ซึ่งทำให้ไม่จำเป็นต้องติดตั้งโปรแกรมหรือมีสภาพแวดล้อมเฉพาะในการรันระบบ แต่พร้อมสำหรับนำไปนำเสนอบน Vercel และบันทึกบน GitHub คลังข้อมูลชื่อ `681894003`

---

## ฟีเจอร์หลัก (Key Features)

### 1. หน้าบ้านสำหรับลูกค้า (Storefront Customer Pages)
- **หน้าแรก (Home)**: แบนเนอร์ภาพอาหารความละเอียดสูง, ปุ่มคอลทูแอคชัน (CTA) ที่สะดุดตา, ข้อมูลเวลาเปิด-ปิด แผนที่เดินทาง และรีวิวความพึงพอใจลูกค้า
- **เมนูออนไลน์ (Interactive Menu)**: แบ่งหมวดหมู่เมนูชัดเจน (จานหลัก, อาหารทานเล่น, ของหวาน, เครื่องดื่ม) พร้อมระบบค้นหา และตัวกรองประเภทอาหาร (มีป้ายกำกับ: เผ็ดร้อน 🌶️, มีถั่ว 🥜, มังสวิรัติ 🥬)
- **ระบบสั่งอาหารออนไลน์ (Online Ordering)**: ตะกร้าสินค้าสไลด์ข้าง, คอนโทรลเพิ่มลดจำนวนอาหาร, คำนวณราคาพร้อมค่าบริการและภาษีมูลค่าเพิ่ม (VAT 7%) ทันที, มีระบบ Checkout รองรับการระบุหมายเลขโต๊ะ (ทานในร้าน) หรือจัดส่ง (สั่งกลับบ้าน) พร้อมช่องทางจ่ายเงินแบบเงินสด และแบบสแกนจ่ายพร้อมเพย์ (PromptPay QR) จำลอง
- **ระบบจองโต๊ะออนไลน์ (Online Booking)**: ฟอร์มระบุชื่อ, เบอร์โทร, วันที่/เวลา, จำนวนคน และคำขอพิเศษ (เช่น เก้าอี้เด็กเล็ก โต๊ะริมหน้าต่าง)
- **โปรโมชัน & อีเวนต์ (Promotions)**: ดีลเด็ดลดราคาทีมงาน โค้ดส่วนลด และประชาสัมพันธ์กิจกรรมดนตรีสด
- **ปุ่มโทรด่วน & ติดต่อร้านแบบลอย (Floating Action Button)**: โทรด่วนหาร้าน หรือคลิกไป Line OA สะดวกต่อการใช้งานบนมือถือ (Mobile-First)

### 2. ระบบพนักงานและระบบหลังร้าน (Staff Auth & Back-office)
- **ล็อกอินพนักงาน (Staff Login)**: ระบบตรวจสอบสิทธิ์พนักงานก่อนเข้าสู่หลังร้าน
- **แดชบอร์ดสรุปผล (Dashboard)**: แสดงข้อมูลสถิติยอดขายรวม, จำนวนออเดอร์วันนี้, การจองโต๊ะรอยืนยัน และสรุปออเดอร์ล่าสุด
- **จัดการสถานะสั่งซื้อ (Orders Manager)**: เปลี่ยนสถานะการดำเนินงานออเดอร์ลูกค้า `รอดำเนินการ -> กำลังปรุง -> เสร็จสิ้น -> ยกเลิก`
- **พิมพ์ใบเสร็จ (Receipt Generator)**: สร้างเลย์เอาต์ใบเสร็จจำลองเครื่องพิมพ์ 80 มม. (Thermal slip) ทันที และสามารถพิมพ์ผ่านระบบเครื่องพิมพ์จริงทางเบราว์เซอร์ได้สวยงาม
- **จัดการการจองโต๊ะ (Bookings Manager)**: อัปเดตยืนยัน หรือ ยกเลิกโต๊ะจองของลูกค้า
- **จัดการรายการเมนูอาหาร (Menu Items Manager)**: เพิ่ม แก้ไขข้อมูล ลบเมนูอาหาร ปรับปรุงราคา อัปเดตลิงก์รูปภาพ และสลับเปิด-ปิดสถานะของอาหารว่าพร้อมขายหรือไม่
- **ตั้งค่าการเชื่อมต่อฐานข้อมูล (Settings)**: รองรับการเก็บข้อมูล Dual-Mode (LocalStorage เป็นเดโมเริ่มต้น หรือ เชื่อมต่อ Supabase Cloud Database)

---

## บัญชีพนักงานสำหรับทดสอบระบบ (Staff Test Accounts)

| บทบาท (Role) | ชื่อผู้ใช้งาน (Username) | รหัสผ่าน (Password) | สิทธิ์เข้าถึง (Access Level) |
|---|---|---|---|
| **ผู้จัดการร้าน (Admin)** | `admin` | `adminpassword` | ทุกฟังก์ชัน (รวมจัดการพนักงาน) |
| **พนักงาน (Staff)** | `staff1` | `password123` | จัดการออเดอร์, จัดการการจองโต๊ะ, จัดการเมนูอาหาร |

---

## โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
681894003/
├── index.html       # หน้าหลักของร้านและสั่งอาหารของลูกค้า
├── login.html       # หน้าล็อกอินสำหรับพนักงานเข้าสู่หลังร้าน
├── admin.html       # หน้าระบบจัดการหลังร้าน (Back-office) และออกใบเสร็จ
├── style.css        # สไตล์ชีทธีมสว่างพรีเมียม (Premium Light Mode) และรูปแบบงานพิมพ์
├── db.js            # ไฟล์ควบคุม Database Layer (LocalStorage / Supabase)
├── app.js           # สคริปต์ควบคุมหน้าบ้าน สั่งอาหาร จองโต๊ะ
├── admin.js         # สคริปต์ควบคุมระบบหลังร้าน จัดการข้อมูล ออกบิล
└── vercel.json      # ไฟล์ตั้งค่า URL Clean Routes สำหรับ Vercel
```

---

## ขั้นตอนการรันและการทดสอบระบบในเครื่อง (Local Testing)

1. ดาวน์โหลดไฟล์ทั้งหมดในโฟลเดอร์ไว้ในเครื่องคอมพิวเตอร์ของคุณ
2. ดับเบิ้ลคลิกไฟล์ `index.html` เพื่อเปิดใช้งานหน้าเว็บหลักและลองกดสั่งอาหารหรือจองโต๊ะได้ทันที
3. คลิกปุ่ม **"พนักงาน"** มุมบนขวา หรือเปิดไฟล์ `login.html` แล้วใช้ข้อมูลทดสอบด้านบนเพื่อเข้าสู่ระบบหลังร้าน
4. ในหน้าหลังร้าน คุณสามารถอัปเดตสถานะออเดอร์, จัดการจองโต๊ะ, แก้ไขเมนูอาหาร หรือกดปุ่ม "พิมพ์ใบเสร็จ" เพื่อเปิดเมนูพิมพ์งานได้ทันที

---

## วิธีการเชื่อมต่อฐานข้อมูล Supabase (Live Mode)

เพื่อป้องกันข้อมูลสูญหายเมื่อปิดเบราว์เซอร์ และรองรับการทำงานแบบเรียลไทม์ผ่านคลาวด์ คุณสามารถเชื่อมโยงระบบกับฐานข้อมูลจริงของ **Supabase** ได้ดังนี้:

1. สมัครใช้งานฟรีที่ [Supabase](https://supabase.com) และสร้างฐานข้อมูล Project ใหม่
2. ไปที่เมนู **SQL Editor** ในหน้าคอนโซลของ Supabase
3. คัดลอกสคริปต์ SQL ด้านล่างนี้ไปวางและกดปุ่ม **Run** เพื่อสร้างเทเบิลและข้อมูลเริ่มต้น:
   ```sql
   -- 1. Create Dishes table (Menu)
   CREATE TABLE dishes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     price NUMERIC(10,2) NOT NULL,
     category TEXT NOT NULL,
     description TEXT,
     image_url TEXT,
     available BOOLEAN DEFAULT true,
     spicy BOOLEAN DEFAULT false,
     nuts BOOLEAN DEFAULT false,
     vegetarian BOOLEAN DEFAULT false
   );

   -- 2. Create Orders table
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     customer_name TEXT NOT NULL,
     customer_phone TEXT NOT NULL,
     table_number TEXT,
     order_type TEXT NOT NULL,
     status TEXT DEFAULT 'pending' NOT NULL,
     total_amount NUMERIC(10,2) NOT NULL
   );

   -- 3. Create Order Items table
   CREATE TABLE order_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
     dish_id UUID,
     dish_name TEXT NOT NULL,
     quantity INTEGER NOT NULL,
     price NUMERIC(10,2) NOT NULL
   );

   -- 4. Create Bookings table
   CREATE TABLE bookings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     customer_name TEXT NOT NULL,
     customer_phone TEXT NOT NULL,
     booking_date DATE NOT NULL,
     booking_time TEXT NOT NULL,
     guests INTEGER NOT NULL,
     special_requests TEXT,
     status TEXT DEFAULT 'pending' NOT NULL
   );

   -- 5. Create Staff table
   CREATE TABLE staff (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     username TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role TEXT NOT NULL,
     name TEXT NOT NULL
   );

   -- Insert Default Staff Account
   INSERT INTO staff (username, password, role, name) VALUES 
   ('admin', 'adminpassword', 'admin', 'ผู้จัดการร้าน'),
   ('staff1', 'password123', 'staff', 'พนักงานบริการ 1');
   ```
4. ไปที่เมนู **Project Settings > API** ใน Supabase เพื่อคัดลอก **Project URL** และ **Anon Public API Key**
5. ล็อกอินเข้าหน้าระบบหลังร้านในระบบของคุณ ไปที่แท็บ **"ตั้งค่าฐานข้อมูล" (Settings)**
6. ติ๊กเครื่องหมายถูกที่ช่อง **"เปิดใช้งานฐานข้อมูล Supabase"** กรอก URL และ Anon Key ที่ได้มาลงในแบบฟอร์ม จากนั้นกดบันทึก ระบบจะทดสอบเชื่อมต่อและรีโหลดใช้งานทันที

---

## ขั้นตอนการอัปโหลดขึ้น GitHub และเผยแพร่บน Vercel

1. สร้าง GitHub Repository ใหม่ในบัญชีของคุณ ตั้งชื่อว่า `681894003`
2. อัปโหลดไฟล์ทั้งหมดของโปรเจกต์ขึ้นไปยัง Repository นี้
3. สมัครและเข้าสู่ระบบ [Vercel](https://vercel.com)
4. คลิกปุ่ม **"Add New" > "Project"** แล้วเลือกเชื่อมโยงกับ GitHub Repository ชื่อ `681894003` ที่พึ่งสร้างขึ้น
5. ในขั้นตอนตั้งค่า Project บน Vercel:
   - ตรวจสอบให้มั่นใจว่า **Framework Preset** ถูกระบุเป็น **Other** หรือตรวจพบเป็น HTML/CSS/JS อัตโนมัติ
   - คลิกปุ่ม **Deploy**
6. เมื่อ Deploy สำเร็จ คุณจะได้รับลิงก์ URL ของเว็บไซต์หน้าร้านอาหารอย่างเป็นทางการ สามารถสั่งอาหารและเปิดใช้งานจริงได้ทันที!

---

## การตั้งค่า Google Analytics (Google Analytics Setup)

ระบบได้รับการติดตั้งและกำหนดค่า **Google Analytics (gtag.js)** เรียบร้อยแล้วด้วยรหัส **Measurement ID**: `G-Z59KHEYC2S` ในส่วน `<head>` ของทุกไฟล์ HTML (`index.html`, `login.html`, `admin.html`)

ข้อมูลการวัดผลและสถิติต่างๆ ของผู้เข้าชมเว็บไซต์จะถูกส่งไปยังแดชบอร์ด Google Analytics ของคุณโดยตรงเมื่อผู้ใช้เปิดใช้งานหน้าเว็บหลังจากเผยแพร่สู่ Vercel หรือทดสอบในเครื่อง!


