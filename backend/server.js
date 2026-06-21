const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000; // Cổng mà Frontend đang gọi tới

// Cho phép các cổng khác nhau (như 5500 của Live Server) gọi vào cổng 5000 này
app.use(cors());
// Cho phép server đọc được dữ liệu dạng JSON gửi lên
app.use(express.json());

// 1. Kết nối MongoDB (Chỉ kết nối 1 lần duy nhất)
const url = 'mongodb://localhost:27017/web_ban_hang';
mongoose.connect(url)
  .then(() => {
    console.log('🎉 Kết nối MongoDB thành công m ơi!');
    seedProduct(); // <-- Chạy hàm thêm sản phẩm mẫu ở đây luôn
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối database:', err);
  });

// 2. Định nghĩa Schema và Model

// Schema cho Điện thoại
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },          
  sku: { type: String, required: true },           
  originalPrice: { type: Number, required: true },  
  salePrice: { type: Number, required: true },      
  memberPrice: { type: Number },                   
  eduPrice: { type: Number },                      
  mainImage: { type: String, required: true },     
  subImages: [{ type: String }], 
  screen: { type: String },
  os: { type: String },
  cpu: { type: String },
  ram: { type: String },
  rom: { type: String },
  rearCamera: { type: String },
  frontCamera: { type: String },
  battery: { type: String },
  // Gộp các trường bị rớt vào đây và xóa variants trùng lặp
  variants: [{
    storage: { type: String },  // "8GB/256GB"
    price: { type: Number }     // 6390000
  }],
  colors: [{
    name: { type: String },
    price: { type: Number },
    image: { type: String }
  }],
  promotionText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Schema cho User
const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Số điện thoại/Email
  password: { type: String, required: true } // Lưu ý: thực tế nên dùng bcrypt để hash mật khẩu
});

// Tạo Model
const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);

// 3. Khởi tạo APIs

// API lấy toàn bộ sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu rồi m ơi!", error });
  }
});

// API lấy chi tiết 1 sản phẩm theo ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy máy" });
    }
    res.json(product);
  } catch (error) {
    console.error("Lỗi Backend Mongoose:", error);
    res.status(500).json({ message: "Lỗi rồi" });
  }
});

// API Đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, username, password } = req.body;
    const newUser = new User({ fullname, username, password });
    await newUser.save();
    res.json({ success: true, message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Tài khoản đã tồn tại hoặc có lỗi xảy ra!" });
  }
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  
  if (user) {
    res.json({ success: true, user: { fullname: user.fullname } });
  } else {
    res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
  }
});

// 4. Hàm chèn dữ liệu mẫu
async function seedProduct() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.create({
        name: "iPhone 15 Pro Max 256GB",
        sku: "IP15PM256",
        originalPrice: 34990000,
        salePrice: 29450000,
        mainImage: "https://images.thinkgroup.vn/unsafe/800x800/https://media-api-beta.thinkpro.vn/media/core/products/2023/9/25/iphone-15-pro-max-titan-tu-nhien-thinkpro-1.png",
        screen: "OLED, 6.7\", Super Retina XDR",
        os: "iOS 17",
        cpu: "Apple A17 Pro 6 nhân",
        ram: "8 GB",
        rom: "256 GB",
        rearCamera: "Chính 48 MP & Phụ 12 MP, 12 MP",
        frontCamera: "12 MP",
        battery: "4422 mAh, Sạc nhanh 20W"
      });
      console.log('🌱 Đã chèn sản phẩm mẫu thành công m ơi!');
    }
  } catch (err) {
    console.error("Lỗi khi seed data:", err);
  }
}

// 5. Lắng nghe/Bật cổng server 5000
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy và lắng nghe ở cổng ${PORT} nhé m!`);
});