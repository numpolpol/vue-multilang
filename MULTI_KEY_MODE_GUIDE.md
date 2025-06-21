# Multi Key Mode Guide

## ภาพรวม (Overview)
Multi Key Mode เป็นฟีเจอร์ที่ช่วยรวม key หลายตัวที่มี value เหมือนกันเข้าด้วยกัน โดยสามารถจัดการได้แม้ว่า value จะสลับ column กันก็ตาม (ยกเว้น empty values)

## วิธีการทำงาน

### กฎการรวม Key:
1. **ค่าต้องตรงกันทุกภาษา** - Key จะรวมกันได้ก็ต่อเมื่อมี value เหมือนกันในทุกภาษา
2. **ไม่สนใจลำดับ column** - แม้ value จะสลับ column กันก็สามารถรวมได้
3. **ไม่รวม empty values** - Key ที่มี value ว่างจะไม่ถูกนำมาพิจารณา
4. **รองรับหลาย key** - สามารถรวม key มากกว่า 2 ตัวได้

### ตัวอย่าง:

**ก่อนรวม:**
```
English:
- common_ok = "OK"
- android_ok = "OK" 
- ios_ok = "OK"
- home_title = "Welcome"

Thai:
- common_ok = "ตกลง"
- android_ok = "ตกลง"
- ios_ok = "ตกลง" 
- home_title = "ยินดีต้อนรับ"
```

**หลังรวม:**
```
✅ MERGED: common_ok (android_ok + ios_ok) = "OK", "ตกลง"
❌ SEPARATE: home_title = "Welcome", "ยินดีต้อนรับ"
```

## การใช้งาน

### 1. เปิดใช้งาน Multi Key Mode
- ไปที่ navbar ตรงกลาง
- หา toggle "Multi Keys (Auto-merge matching values)"
- คลิกเพื่อเปิดใช้งาน (จะเป็นสีน้ำเงิน)

### 2. อัปโหลดไฟล์
- อัปโหลดไฟล์ .strings และ .xml สำหรับแต่ละภาษา
- ระบบจะจัดกลุ่มตามภาษาอัตโนมัติ

### 3. ตัวบ่งชี้ในหน้าจอ
- **Mode indicator**: แสดง "Multi Key Mode: ON"
- **Table header**: ไอคอน 🔗 ข้าง "Key"
- **Merged rows**: แสดงเป็น `primary_key (secondary_key1 + secondary_key2)`
- **Badge**: แสดง "multi-key" ในแถวที่รวมแล้ว

### 4. การแก้ไข
- แก้ไขได้ปกติในช่อง value
- การเปลี่ยนแปลงจะมีผลกับทุก key ที่รวมไว้
- ค่าจะ sync กันทุก platform

### 5. การ Export
- **iOS export**: จะได้ key แบบ iOS (ios_* หรือไม่ใช่ android_*)
- **Android export**: จะได้ key แบบ Android (android_*)
- ระบบแยก merged key กลับเป็น individual keys อัตโนมัติ

## ข้อดี

1. **ลดการซ้ำซ้อน**: ไม่ต้องแก้ไข translation เดียวกันหลายครั้ง
2. **มองเห็นความเชื่อมโยง**: เห็นได้ชัดว่า key ไหนเชื่อมโยงกัน
3. **แก้ไขแบบ sync**: แก้ครั้งเดียว อัปเดตทุก platform
4. **Export อัตโนมัติ**: สร้างไฟล์แยกตาม platform
5. **ป้องกันข้อผิดพลาด**: หลีกเลี่ยงความไม่สอดคล้องระหว่าง platform

## ไฟล์ทดสอบ

ใช้ไฟล์ตัวอย่างใน `/src/sample/`:
- `multi_en.strings` & `multi_en.xml` (อังกฤษ)
- `multi_th.strings` & `multi_th.xml` (ไทย)

ไฟล์เหล่านี้มี key ที่ตรงกัน:
- `common_ok` + `android_ok` = "OK"/"ตกลง"
- `home_welcome` + `welcome_message` = "Welcome"/"ยินดีต้อนรับ"
- `button_save` + `save_btn` = "Save"/"บันทึก"
- `message_success` + `success_text` = "Success"/"สำเร็จ"

## ข้อแตกต่างจาก Dual Key Mode

| ฟีเจอร์ | Dual Key Mode | Multi Key Mode |
|---------|---------------|----------------|
| จำนวน key | จำกัด 2 key | ไม่จำกัดจำนวน |
| การเปรียบเทียบ | ต้องเหมือนกันทุก column | ไม่สนใจลำดับ column |
| Empty values | รวมได้ | ไม่รวม |
| UI indicator | "Dual Key Mode" | "Multi Key Mode" |
| Badge | "merged" | "multi-key" |

Multi Key Mode ให้ความยืดหยุ่นมากกว่าและสามารถจัดการกับ pattern การตั้งชื่อ key ที่หลากหลายได้ดีกว่า
