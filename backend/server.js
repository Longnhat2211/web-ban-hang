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


// Gọi hàm này sau khi mongoose kết nối thành công
mongoose.connect('mongodb://localhost:27017/web_ban_hang')
  .then(() => {
    console.log('🎉 Kết nối MongoDB thành công');
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

// Thêm đoạn định nghĩa hàm này vào trước dòng 92
async function seedProduct() {
    try {
        // Kiểm tra xem database đã có sản phẩm nào chưa
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
            console.log("🌱 Đã chèn sản phẩm mẫu thành công m ơi!");
        }
    } catch (err) {
        console.error("Lỗi khi seed data:", err);
    }
}