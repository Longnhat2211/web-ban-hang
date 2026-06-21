
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

// --- 2. SLIDER LOGIC ---
if(slider) {
    document.getElementById("next").onclick = () => {
        current = (current + 1) % images.length;
        slider.src = images[current];
    };
    document.getElementById("prev").onclick = () => {
        current = (current - 1 + images.length) % images.length;
        slider.src = images[current];
    };
    setInterval(() => {
        current = (current + 1) % images.length;
        slider.src = images[current];
    }, 4000);
}

// --- 3. PRODUCT SLIDER LOGIC ---
const productList = document.querySelector(".product-list");
if(productList) {
    let currentPosition = 0;
    document.getElementById("next_2").onclick = () => {
        currentPosition -= 260;
        productList.style.transform = `translateX(${currentPosition}px)`;
    };
    document.getElementById("prev_2").onclick = () => {
        currentPosition = Math.min(0, currentPosition + 260);
        productList.style.transform = `translateX(${currentPosition}px)`;
    };
}

// --- 4. TÌM KIẾM & API ---
let tatCaSanPham = []; 

function layDanhSachSanPham() {
    fetch('http://localhost:5000/api/products') 
        .then(response => response.json())
        .then(data => {
            tatCaSanPham = data;
            hienThiGiaoDien(tatCaSanPham);
        })
        .catch(error => console.error('Lỗi lấy sản phẩm:', error));
}

function hienThiGiaoDien(danhSachSP) {
    const danhSachElement = document.getElementById('danh-sach-sp'); 
    if (!danhSachElement) return; 
    
    danhSachElement.innerHTML = '';
    if (danhSachSP.length === 0) {
        danhSachElement.innerHTML = '<p style="text-align:center; width:100%;">Không tìm thấy sản phẩm!</p>';
        return;
    }

    let html = '';
    danhSachSP.forEach(sp => {
        const danhSachMau = (sp.colors && Array.isArray(sp.colors)) ? sp.colors.map(c => c.name || c.colorName || JSON.stringify(c)).join(', ') : 'Chưa cập nhật';
        let phanTramGiamGia = (sp.originalPrice && sp.salePrice && sp.originalPrice > sp.salePrice) ? Math.round(((sp.originalPrice - sp.salePrice) / sp.originalPrice) * 100) : 0;
        const nhanGiamGia = phanTramGiamGia > 0 ? `<span class="giam_gia">-${phanTramGiamGia}%</span>` : '';

        html += `
            <div class="product-card">
                <a href="chitiet.html?id=${sp._id}"><img src="${sp.mainImage}" alt="${sp.name}"></a>
                <a href="chitiet.html?id=${sp._id}"><h3>${sp.name}</h3></a>
                <p class="product-color"> Màu: ${danhSachMau} </p>
                <p class="gia_moi">${sp.salePrice.toLocaleString('vi-VN')} đ</p>
                <p class="gia_cu">${sp.originalPrice.toLocaleString('vi-VN')} đ</p>
                ${nhanGiamGia}
                <button>Mua ngay</button>
            </div>
        `;
    });
    danhSachElement.innerHTML = html;
}

// --- 5. TÍNH NĂNG GỢI Ý TÌM KIẾM ---
const inputTimKiem = document.getElementById("input-tim-kiem");
const danhSachGoiY = document.getElementById("danh-sach-goi-y");

if(inputTimKiem) {
    inputTimKiem.addEventListener("input", function() {
        const tuKhoa = this.value.toLowerCase().trim();
        if (!danhSachGoiY) return;
        danhSachGoiY.innerHTML = ''; 
        if (tuKhoa === "") return;

        const ketQua = tatCaSanPham.filter(sp => sp.name.toLowerCase().includes(tuKhoa));
        ketQua.slice(0, 5).forEach(sp => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${sp.mainImage}" style="width:40px;height:40px;">
                <div class="goi-y-info">
                    <strong>${sp.name}</strong><br>
                    <span>${sp.salePrice.toLocaleString('vi-VN')} đ</span>
                </div>
            `;
            li.onclick = () => { window.location.href = `chitiet.html?id=${sp._id}`; };
            danhSachGoiY.appendChild(li);
        });
    });
}

// Xử lý nút tìm kiếm chính
const btnTimKiem = document.querySelector(".tim_kiem");
if(btnTimKiem) {
    btnTimKiem.onclick = () => {
        const tuKhoa = inputTimKiem.value.toLowerCase().trim();
        const ketQua = tatCaSanPham.filter(sp => sp.name.toLowerCase().includes(tuKhoa));
        hienThiGiaoDien(ketQua);
        if(danhSachGoiY) danhSachGoiY.innerHTML = '';
    };
}

document.addEventListener("DOMContentLoaded", layDanhSachSanPham);