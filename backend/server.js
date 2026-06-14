const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000; // Cổng mà Frontend của m đang gọi tới

// Cho phép các cổng khác nhau (như 5500 của Live Server) gọi vào cổng 5000 này
app.use(cors());
// Cho phép server đọc được dữ liệu dạng JSON gửi lên
app.use(express.json());

// 1. Kết nối MongoDB
const url = 'mongodb://localhost:27017/web_ban_hang';
mongoose.connect(url)
  .then(() => {
    console.log('🎉 Kết nối MongoDB thành công m ơi!');
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối database:', err);
  });





// Định nghĩa cấu trúc cho một sản phẩm Điện thoại
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Tên ĐT: "HONOR X7d 4G 8Gb/256Gb"
  sku: { type: String, required: true },           // Mã sản phẩm: "LGNLX2256OCEAN"
  originalPrice: { type: Number, required: true },  // Giá gốc: 6690000
  salePrice: { type: Number, required: true },      // Giá bán hiện tại: 6390000
  memberPrice: { type: Number },                   // Giá Hoàng Hà Member: 6017000
  eduPrice: { type: Number },                      // Giá Học sinh/Sinh viên: 5990000
  mainImage: { type: String, required: true },     // Ảnh chính của sản phẩm
  subImages: [{ type: String }],                   // Mảng các ảnh phụ (Xem tất cả hình ảnh)
  
  // Danh sách các phiên bản bộ nhớ (8GB/128GB, 8GB/256GB...)
  variants: [{
    storage: { type: String },  // "8GB/256GB"
    price: { type: Number }     // 6390000
  }],

  // Danh sách các màu sắc lựa chọn
  colors: [{
    name: { type: String },     // "Xanh", "Vàng", "Đen"
    price: { type: Number },    // 6390000
    image: { type: String }     // Link ảnh của màu đó nếu có
  }],

  promotionText: { type: String }, // Trả góp 0%...
  createdAt: { type: Date, default: Date.now } // Ngày đăng sản phẩm
});

// Tạo Model từ Schema trên để thao tác với Database
const Product = mongoose.model('Product', ProductSchema);




// API lấy toàn bộ sản phẩm từ MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Lấy tất cả sản phẩm trong database
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu rồi m ơi!", error });
  }
});




// 3. Lắng nghe/Bật cổng server 5000
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy và lắng nghe ở cổng ${PORT} nhé m!`);
});



// Hàm tự động thêm sản phẩm mẫu để test dữ liệu
async function seedProduct() {
  try {
    // Kiểm tra xem database có sản phẩm nào chưa, nếu chưa có thì mới thêm
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.create({
        name: "HONOR X7d 4G 8Gb/256Gb",
        sku: "LGNLX2256OCEAN",
        originalPrice: 6690000,
        phanTram: 12,
        salePrice: 6390000,
        mainImage: "https://vcdn-so hóa.vnecdn.net/2024/01/15/honor-x7d-1-1705315155.jpg", // Ví dụ link ảnh
        subImages: ["ảnh_phụ_1.jpg", "ảnh_phụ_2.jpg"],
        promotionText: "Trả góp 0% thẻ TD/CTTC chỉ từ 702,000 đ x 6 tháng",
        variants: [
          { storage: "8GB/128GB", price: 6090000 },
          { storage: "5G 8GB/256GB", price: 7090000 },
          { storage: "8GB/256GB", price: 6390000 }
        ],
        colors: [
          { name: "Xanh", price: 6390000 },
          { name: "Vàng", price: 6390000 },
          { name: "Đen", price: 6390000 }
        ]
      });
      console.log("💾 Đã thêm thành công sản phẩm HONOR mẫu vào MongoDB rồi m nhé!");
    }
  } catch (err) {
    console.error("Lỗi tạo sản phẩm mẫu:", err);
  }
}

// Gọi hàm này sau khi mongoose kết nối thành công
mongoose.connect('mongodb://localhost:27017/web_ban_hang')
  .then(() => {
    console.log('🎉 Kết nối MongoDB thành công m ơi!');
    seedProduct(); // <-- Chạy hàm thêm sản phẩm mẫu ở đây
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Mongoose tự động xử lý ép kiểu chuỗi thành ObjectId nên dùng findById cực gọn
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