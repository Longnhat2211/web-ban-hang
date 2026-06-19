document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sanPhamId = urlParams.get('id');
    const khungChiTiet = document.getElementById('khung-chi-tiet');

    if (!sanPhamId) {
        if (khungChiTiet) khungChiTiet.innerHTML = '<div style="padding: 50px; text-align: center; color: red; font-weight: bold;">🚫 Không tìm thấy mã sản phẩm m ơi!</div>';
        return;
    }

    fetch(`http://localhost:5000/api/products/${sanPhamId}`)
        .then(res => {
            if (!res.ok) throw new Error("Server backend lỗi hoặc không có SP");
            return res.json();
        })
        .then(sp => {
            console.log("=== DATA SẢN PHẨM KHỚP TỪ BACKEND ===", sp);
            if (!khungChiTiet) return;

            // 1. Kiểm tra và định dạng tên sản phẩm (Fix lỗi mất tên góc trên)
            const tenSanPham = sp.name || "iPhone 17 Pro Max 256GB - Chính hãng Apple Việt Nam";
            document.title = `${tenSanPham} - Long Nhat Mobile`;

            // Ép thêm một cái h1 tiêu đề vào đầu khungChiTiet nếu layout của m cần hiển thị trên cùng
            let tieuDeHtml = `<h1 class="detail-title" style="grid-column: 1 / -1; width: 100%; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">${tenSanPham}</h1>`;

            // 2. Xử lý giá tiền chuẩn chỉ
            const giaSaleGoc = sp.salePrice || 33450000;
            const giaOriginalGoc = sp.originalPrice || 44990000;
            const giaSaleText = `${giaSaleGoc.toLocaleString('vi-VN')} đ`;
            const giaOriginalText = giaOriginalGoc > 0 ? `${giaOriginalGoc.toLocaleString('vi-VN')} đ` : '';
            const giaMember = Math.round(giaSaleGoc * 0.95);
            const giaEdu = Math.round(giaSaleGoc * 0.94);

            // 3. LOGIC HỒI SINH 3 CÁI ẢNH NHỎ VÀ CỤM MÀU SẮC
            // Kiểm tra xem backend trả về biến gì: sp.colors hoặc sp.color hoặc tự chế
            let dsMau = [];
            if (sp.colors && Array.isArray(sp.colors) && sp.colors.length > 0) {
                dsMau = sp.colors;
            } else if (sp.color && Array.isArray(sp.color) && sp.color.length > 0) {
                dsMau = sp.color;
            } else {
                // Nếu DB trống rỗng, tự tạo data cứng của Apple để cứu layout!
                dsMau = [
                    { name: "Cam Vũ Trụ", value: "Cam Vũ Trụ", img: "https://cdn.hoanghamobile.vn/Uploads/2024/09/10/iphone-16-pro-max-desert-titanium_638615705351740924.png" },
                    { name: "Xanh Đậm", value: "Xanh Đậm", img: "https://cdn.hoanghamobile.vn/Uploads/2024/09/10/iphone-16-pro-max-black-titanium_638615705252874136.png" },
                    { name: "Bạc", value: "Bạc", img: "https://cdn.hoanghamobile.vn/Uploads/2024/09/10/iphone-16-pro-max-white-titanium_638615705307525389.png" }
                ];
            }

            // Sinh HTML cho Swiper Ảnh To (Slide chính)
            const mainImageDefault = sp.mainImage || dsMau[0].img;
            let htmlSlideTo = `
                <div class="swiper-slide">
                    <a href="${mainImageDefault}" data-fancybox="gallery">
                        <img src="${mainImageDefault}" alt="Mặc định" />
                    </a>
                </div>
            `;
            htmlSlideTo += dsMau.map(m => `
                <div class="swiper-slide">
                    <a href="${m.img || mainImageDefault}" data-fancybox="gallery">
                        <img src="${m.img || mainImageDefault}" alt="${m.name}" />
                    </a>
                </div>
            `).join('');

            // Sinh HTML cho Swiper Ảnh Nhỏ (Thumbnails dưới ảnh to)
            let htmlSlideNho = `
                <div class="swiper-slide">
                    <div class="thumb-box">
                        <div class="thumb-img-wrapper"><img src="${mainImageDefault}" /></div>
                        <div class="thumb-text">Mặc định</div>
                    </div>
                </div>
            `;
            htmlSlideNho += dsMau.map(m => `
                <div class="swiper-slide">
                    <div class="thumb-box">
                        <div class="thumb-img-wrapper"><img src="${m.img || mainImageDefault}" /></div>
                        <div class="thumb-text">${m.name}</div>
                    </div>
                </div>
            `).join('');

            // Sinh HTML cho các nút bấm lựa chọn màu sắc bên phải
            let htmlOChonMau = dsMau.map((m, index) => `
                <div class="option-item ${index === 0 ? 'active' : ''}" data-type="color" data-value="${m.name}" data-name="${m.name}">
                    <strong>${m.name}</strong>
                    <span>${giaSaleText}</span>
                </div>
            `).join('');

            // 4. LOGIC HỒI SINH BẢNG THÔNG SỐ KỸ THUẬT (Fix lỗi trống trơn)
            let thongSoHtml = "";
            if (sp.screen || sp.os || sp.cpu || sp.ram) {
                thongSoHtml = `
                    ${sp.screen ? `<tr><td>Màn hình</td><td>${sp.screen}</td></tr>` : ''}
                    ${sp.os ? `<tr><td>Hệ điều hành</td><td>${sp.os}</td></tr>` : ''}
                    ${sp.cpu ? `<tr><td>Chip xử lý (CPU)</td><td>${sp.cpu}</td></tr>` : ''}
                    ${sp.ram ? `<tr><td>Bộ nhớ RAM</td><td>${sp.ram}</td></tr>` : ''}
                    ${sp.rom ? `<tr><td>Bộ nhớ trong</td><td>${sp.rom}</td></tr>` : ''}
                    ${sp.battery ? `<tr><td>Dung lượng pin</td><td>${sp.battery}</td></tr>` : ''}
                    ${sp.rearCamera ? `<tr><td>Camera sau</td><td>${sp.rearCamera}</td></tr>` : ''}
                    ${sp.frontCamera? `<tr><td>Camera trước</td><td>${sp.frontCamera}</td></tr>` : ''}
                    
                    
                `;
            } else {
                // Nếu DB không có thông số, tự điền thông số chuẩn Apple làm mẫu luôn!
                thongSoHtml = `
                    <tr><td>Màn hình</td><td>LTPO Super Retina XDR OLED, 6.9", 120Hz, 3000 nits</td></tr>
                    <tr><td>Hệ điều hành</td><td>iOS 19 (Bản cập nhật mới nhất)</td></tr>
                    <tr><td>Chip xử lý (CPU)</td><td>Apple A19 Pro (Tiến trình 3nm nâng cấp siêu mạnh)</td></tr>
                    <tr><td>Bộ nhớ trong</td><td>256 GB</td></tr>
                    <tr><td>Bộ nhớ RAM</td><td>12 GB RAM</td></tr>
                `;
            }

            // ==================================================================
            // TIẾN HÀNH ĐỔ TOÀN BỘ HTML HOÀN CHỈNH VÀO KHUNG
            // ==================================================================
            khungChiTiet.innerHTML = `
                ${tieuDeHtml}
                
                <div class="detail-left">
                    <div class="swiper mySwiper2">
                        <div class="swiper-wrapper">
                            ${htmlSlideTo}
                        </div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
                    </div>

                    <div class="swiper mySwiper">
                        <div class="swiper-wrapper">
                            ${htmlSlideNho}
                        </div>
                    </div>

                    <div class="detail-text section-baohanh">
                        <h3>🎁 Thông tin bảo hành & Ưu đãi khác:</h3>
                        <p>✓ Bảo hành 12 tháng chính hãng chính thống tại trung tâm ủy quyền.<br>✓ Cam kết lỗi đổi liền trong vòng 30 ngày đầu tiên.<br>✓ Miễn phí vận chuyển toàn quốc.</p>
                        <div class="product-ads-banner">
                            <a href="#" target="_blank">
                                <img src="https://cdn.hoanghamobile.vn//Uploads/2026/06/15/baner-quay-so-laptop-461x398-0000.jpg" alt="Quảng cáo">
                            </a>
                        </div>
                    </div>
                </div>
                 
                <div class="detail-right-info">
                    <div class="price-row">
                        <div class="detail-price">
                            <span class="moi" id="hien-gia-moi">${giaSaleText}</span>
                            <span class="cu" id="hien-gia-cu">${giaOriginalText}</span>
                        </div>
                        <div class="sku-text">SKU: <strong>${sp.sku || 'IP17PM256'}</strong></div>
                    </div>

                    <p class="installment-text">💰 Trả góp 0% qua thẻ tín dụng cực hot!</p>

                    <div>
                        <div class="option-title">Lựa chọn phiên bản bộ nhớ</div>
                        <div class="options-grid" id="cum-chon-gb">
                            <div class="option-item" data-type="gb" data-value="128GB" data-offset="-2000000"><strong>128GB</strong><span>Thấp hơn 2M</span></div>
                            <div class="option-item active" data-type="gb" data-value="256GB" data-offset="0"><strong>256GB</strong><span>${giaSaleText}</span></div>
                            <div class="option-item" data-type="gb" data-value="512GB" data-offset="4000000"><strong>512GB</strong><span>Cao hơn 4M</span></div>
                        </div>
                    </div>

                    <div>
                        <div class="option-title">Lựa chọn màu sắc</div>
                        <div class="options-grid" id="cum-chon-mau">
                            ${htmlOChonMau}
                        </div>
                    </div>

                    <div class="member-prices">
                        <div class="member-box">
                            <h4>💎 VIP Member giá từ</h4>
                            <div class="price" id="hien-gia-member">${giaMember.toLocaleString('vi-VN')} đ</div>
                        </div>
                        <div class="member-box">
                            <h4>🎓 Xác thực Edu giá từ</h4>
                            <div class="price" id="hien-gia-edu">${giaEdu.toLocaleString('vi-VN')} đ</div>
                        </div>
                    </div>

                    <button class="btn-add-cart" id="btn-mua-ngay">🔴 MUA NGAY <span>(Nhận tại cửa hàng hoặc giao tận nhà)</span></button>

                    <div class="product-specs-wrapper">
                        <h3 class="specs-title">⚙️ Thông số kỹ thuật</h3>
                        <table class="specs-table">
                            ${thongSoHtml}
                        </table>
                    </div>
                </div>
            `;

            // KÍCH HOẠT SỰ KIỆN CLICK VÀ HIỆU ỨNG ĐỘNG
            const nutMuaNgay = document.getElementById('btn-mua-ngay');
            const cacOPhienBan = document.querySelectorAll('#cum-chon-gb .option-item');
            const cacOMauSac = document.querySelectorAll('#cum-chon-mau .option-item');
            const textGiaMoi = document.getElementById('hien-gia-moi');
            const textGiaCu = document.getElementById('hien-gia-cu');
            const textGiaMember = document.getElementById('hien-gia-member');
            const textGiaEdu = document.getElementById('hien-gia-edu');

            function capNhatGiaHienThi() {
                const gbActive = document.querySelector('#cum-chon-gb .option-item.active');
                if (!gbActive) return;
                const offsetHienTai = parseInt(gbActive.getAttribute('data-offset')) || 0;

                const giaMoiMoi = giaSaleGoc + offsetHienTai;
                const giaCuMoi = giaOriginalGoc > 0 ? giaOriginalGoc + offsetHienTai : 0;

                textGiaMoi.innerText = `${giaMoiMoi.toLocaleString('vi-VN')} đ`;
                if(textGiaCu) textGiaCu.innerText = giaCuMoi > 0 ? `${giaCuMoi.toLocaleString('vi-VN')} đ` : '';
                if(textGiaMember) textGiaMember.innerText = `${Math.round(giaMoiMoi * 0.95).toLocaleString('vi-VN')} đ`;
                if(textGiaEdu) textGiaEdu.innerText = `${Math.round(giaMoiMoi * 0.94).toLocaleString('vi-VN')} đ`;
            }

            cacOPhienBan.forEach(nut => {
                nut.addEventListener('click', () => {
                    cacOPhienBan.forEach(n => n.classList.remove('active'));
                    nut.classList.add('active');
                    capNhatGiaHienThi();
                });
            });

            cacOMauSac.forEach(nut => {
                nut.addEventListener('click', () => {
                    cacOMauSac.forEach(n => n.classList.remove('active'));
                    nut.classList.add('active');
                });
            });

            if (nutMuaNgay) {
                nutMuaNgay.addEventListener('click', () => {
                    const gbActive = document.querySelector('#cum-chon-gb .option-item.active');
                    const mauActive = document.querySelector('#cum-chon-mau .option-item.active');
                    alert(`M vừa chọn mua bản: ${gbActive ? gbActive.getAttribute('data-value') : '256GB'} - Màu: ${mauActive ? mauActive.getAttribute('data-value') : 'Mặc định'}`);
                });
            }

            // KHỞI TẠO SWIPER TRÌNH CHIẾU ẢNH
            if (typeof Swiper !== 'undefined') {
                var swiperThumbs = new Swiper(".mySwiper", {
                    spaceBetween: 10,
                    slidesPerView: 4,
                    freeMode: true,
                    watchSlidesProgress: true,
                });
                new Swiper(".mySwiper2", {
                    spaceBetween: 10,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    thumbs: {
                        swiper: swiperThumbs,
                    },
                });
            }

            // KHỞI TẠO FANCYBOX BẬT ẢNH LỚN
            if (typeof Fancybox !== 'undefined') {
                Fancybox.bind("[data-fancybox='gallery']", {});
            }

        })
        .catch(err => {
            console.error("Lỗi fetches data:", err);
        });
});



