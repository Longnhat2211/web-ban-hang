const images = [
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/05/30/xiaomi-17t-web_639157494619050970.png",
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/05/28/iphone-17-web_639155782281586569.png",
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/05/22/oppo-find-x9-web.png",
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/10/note-15-series-web.png",
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/05/11/galaxy-s25-fe-1200x375-1105.png",
    "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/05/15/galaxy-s26-ultra-1200x375-1505.png",
];

let current = 0;

const slider = document.getElementById("slider");

document.getElementById("next").onclick = function(){

    current++;

    if(current >= images.length){
        current = 0;
    }

    slider.src = images[current];
};

document.getElementById("prev").onclick = function(){

    current--;

    if(current < 0){
        current = images.length - 1;
    }

    slider.src = images[current];
};
setInterval(() => {

    current++;

    if(current >= images.length){
        current = 0;
    }

    slider.src = images[current];

}, 4000);


const productList = document.querySelector(".product-list");

let currentPosition = 0;

document.getElementById("next_2").onclick = function(){

    currentPosition -= 260;

    productList.style.transform =
        `translateX(${currentPosition}px)`;
};

document.getElementById("prev_2").onclick = function(){

    currentPosition += 260;

    if(currentPosition > 0){
        currentPosition = 0;
    }

    productList.style.transform =
        `translateX(${currentPosition}px)`;
};


// 1. Hàm gọi API bốc dữ liệu từ Backend cổng 5000 về (Giữ nguyên)
function layDanhSachSanPham() {
  fetch('http://localhost:5000/api/products') 
    .then(response => response.json())
    .then(data => {
      hienThiGiaoDien(data);
    })
    .catch(error => {
      console.error('Lỗi lấy sản phẩm rồi m ơi:', error);
    });
}

// 2. Hàm tự động sản xuất HTML đồng bộ 100% với file CSS 
function hienThiGiaoDien(danhSachSP) {
  const danhSachElement = document.getElementById('danh-sach-sp'); 
  
  if (!danhSachElement) return;
  danhSachElement.innerHTML = '';

  danhSachSP.forEach(sp => {

    const danhSachMau = sp.colors && Array.isArray(sp.colors)
      ? sp.colors.map(c => c.name || c.colorName || JSON.stringify(c)).join(', ')
      : 'Chưa cập nhật';

    // 2. Tính toán phần trăm giảm giá tự động
    let phanTramGiamGia = 0;
    if (sp.originalPrice && sp.salePrice && sp.originalPrice > sp.salePrice) {
      phanTramGiamGia = Math.round(((sp.originalPrice - sp.salePrice) / sp.originalPrice) * 100);
    }

   
    const nhanGiamGia = phanTramGiamGia > 0 
      ? `<span class="giam_gia">-${phanTramGiamGia}%</span>` 
      : '';
    
    const linkAnhChuan = sp.mainImage

    const sanPhamHtml = `
      <div class="product-card">
       <a href="chitiet.html?id=${sp._id}">
        <img src="${linkAnhChuan}" alt="${sp.name}">
       </a>

       <a href="chitiet.html?id=${sp._id}">
        <h3>${sp.name}</h3>
       </a>
    
        <p class="product-color"> Màu: ${danhSachMau} </p>
    
        <p class="gia_moi">${sp.salePrice.toLocaleString('vi-VN')} đ</p>

        <p class="gia_cu">${sp.originalPrice.toLocaleString('vi-VN')} đ</p>

        ${nhanGiamGia}
        <button>Mua ngay</button>
      </div>
    `;
    
    danhSachElement.innerHTML += sanPhamHtml; 
  });
}

// 3. Đợi HTML load xong hoàn toàn mới cho chạy kích hoạt
document.addEventListener("DOMContentLoaded", () => {
  layDanhSachSanPham(); 
});