document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sanPhamId = urlParams.get('id');
    const khungChiTiet = document.getElementById('khung-chi-tiet');

    if (!sanPhamId) {
        if (khungChiTiet) khungChiTiet.innerHTML = '<p>Không tìm thấy mã sản phẩm m ơi!</p>';
        return;
    }

    fetch(`http://localhost:5000/api/products/${sanPhamId}`)
        .then(res => {
            if (!res.ok) throw new Error("Server lỗi");
            return res.json();
        })
        .then(sp => {
            if (!khungChiTiet) return;

            // 1. Tạo tiêu đề sản phẩm độc lập ở trên
            const mainElement = khungChiTiet.parentElement;
            const titleHtml = document.createElement('h1');
            titleHtml.className = 'detail-title';
            titleHtml.innerText = sp.name || "Tên sản phẩm";
            mainElement.insertBefore(titleHtml, khungChiTiet);

            // Định dạng giá tiền gốc ban đầu
            const giaMoi = sp.salePrice ? `${sp.salePrice.toLocaleString('vi-VN')} đ` : 'Liên hệ';
            const giaCu = sp.originalPrice ? `${sp.originalPrice.toLocaleString('vi-VN')} đ` : '';
            const giaMember = sp.memberPrice ? `${sp.memberPrice.toLocaleString('vi-VN')} đ` : (sp.salePrice ? `${(sp.salePrice * 0.95).toLocaleString('vi-VN')} đ` : 'Liên hệ');
            const giaEdu = sp.eduPrice ? `${sp.eduPrice.toLocaleString('vi-VN')} đ` : (sp.salePrice ? `${(sp.salePrice * 0.94).toLocaleString('vi-VN')} đ` : 'Liên hệ');

            // Xử lý danh sách màu sắc từ database
            let mauSacHtml = '';
            if (sp.colors && Array.isArray(sp.colors) && sp.colors.length > 0) {
                mauSacHtml = sp.colors.map((c, index) => `
                    <div class="option-item ${index === 0 ? 'active' : ''}" data-type="color" data-name="${c.name}">
                        <strong>${c.name}</strong>
                        <span>${giaMoi}</span>
                    </div>
                `).join('');
            } else {
                mauSacHtml = '<div class="option-item active" data-type="color" data-name="Mặc định"><strong>Mặc định</strong><span>${giaMoi}</span></div>';
            }

            // 2. Đổ bộ khung HTML vào trang chi tiết
            khungChiTiet.innerHTML = `
                <div class="detail-left">
                   <img id="anh-chinh" src="${sp.mainImage || ''}" alt="${sp.name || ''}">
    
                   <div class="thumbnail-container" id="cum-anh-nho">
                       <div class="thumbnail-item active" data-src="${sp.mainImage || ''}">
                           <img src="${sp.mainImage || ''}" alt="main">
                   </div>
        
                   ${sp.images && Array.isArray(sp.images) ? sp.images.map(imgUrl => `
                       <div class="thumbnail-item" data-src="${imgUrl}">
                           <img src="${imgUrl}" alt="sub">
                       </div>
                   `).join('') : ''}
         </div>
</div>
                 
                
                <div class="detail-right">
                    <div class="price-row">
                        <div class="detail-price">
                            <span class="moi" id="hien-gia-moi">${giaMoi}</span>
                            <span class="cu" id="hien-gia-cu">${giaCu}</span>
                        </div>
                        <div class="sku-text">SKU: <strong>${sp.sku || 'Chưa rõ'}</strong></div>
                    </div>

                    <p class="installment-text">${sp.promotionText || 'Trả góp 0% qua thẻ tín dụng cực hot m ơi!'}</p>


                    <div>
                        <div class="option-title">Lựa chọn phiên bản</div>
                        <div class="options-grid" id="cum-chon-gb">
                            <div class="option-item" data-type="gb" data-value="128GB" data-offset="-2000000"><strong>128GB</strong><span>Thấp hơn 2M</span></div>
                            <div class="option-item active" data-type="gb" data-value="256GB" data-offset="0"><strong>256GB</strong><span>${giaMoi}</span></div>
                            <div class="option-item" data-type="gb" data-value="512GB" data-offset="4000000"><strong>512GB</strong><span>Cao hơn 4M</span></div>
                        </div>
                    </div>


                    <div>
                        <div class="option-title">Lựa chọn màu sắc</div>
                        <div class="options-grid" id="cum-chon-mau">
                            ${mauSacHtml}
                        </div>
                    </div>


                    <div class="member-prices">
                        <div class="member-box">
                            <h4>VIP Member giá chỉ từ</h4>
                            <div class="price" id="hien-gia-member">${giaMember}</div>
                        </div>
                        <div class="member-box">
                            <h4>Xác thực Edu (HSSV) giá từ</h4>
                            <div class="price" id="hien-gia-edu">${giaEdu}</div>
                        </div>
                    </div>


                    <div class="detail-text">
                        <h3>🎁 Thông tin bảo hành & Ưu đãi khác:</h3>
                        <p>✓ Bảo hành 12 tháng chính hãng chính thống.<br>✓ Cam kết lỗi đổi liền trong vòng 30 ngày đầu.<br>✓ Miễn phí vận chuyển toàn quốc.</p>
                    </div>


                    <button class="btn-add-cart" id="btn-mua-ngay">
                        MUA NGAY
                        <span>(Giao tận nhà hoặc nhận tại cửa hàng)</span>
                    </button>
                </div>
            `;

            // 3. LOGIC XỬ LÝ CLICK TƯƠNG TÁC ĐỔI VIỀN XANH VÀ ĐỔI GIÁ TIỀN
            const giaGocChuan = sp.salePrice || 0;
            const giaCuGocChuan = sp.originalPrice || 0;

            // Hàm tính lại toàn bộ giá tiền khi người dùng bấm chọn cấu hình khác nhau
            function capNhatGiaHienThi() {
                const gbActive = document.querySelector('#cum-chon-gb .option-item.active');
                // Lấy số tiền chênh lệch (ví dụ bản 128gb giảm 2 triệu, bản 512gb tăng 4 triệu)
                const offsetHienTai = parseInt(gbActive.getAttribute('data-offset')) || 0;

                const giaMoiMoi = giaGocChuan + offsetHienTai;
                const giaCuMoi = giaCuGocChuan > 0 ? giaCuGocChuan + offsetHienTai : 0;

                // Cập nhật text ra màn hình giao diện công nghệ
                document.getElementById('hien-gia-moi').innerText = `${giaMoiMoi.toLocaleString('vi-VN')} đ`;
                if(giaCuMoi > 0) {
                    document.getElementById('hien-gia-cu').innerText = `${giaCuMoi.toLocaleString('vi-VN')} đ`;
                }
                document.getElementById('hien-gia-member').innerText = `${Math.round(giaMoiMoi * 0.95).toLocaleString('vi-VN')} đ`;
                document.getElementById('hien-gia-edu').innerText = `${Math.round(giaMoiMoi * 0.94).toLocaleString('vi-VN')} đ`;
            }

            // Sự kiện Click chọn GB bộ nhớ
            const danhSachNutGb = document.querySelectorAll('#cum-chon-gb .option-item');
            danhSachNutGb.forEach(nut => {
                nut.addEventListener('click', () => {
                    danhSachNutGb.forEach(n => n.classList.remove('active')); // Xóa viền xanh cũ
                    nut.classList.add('active'); // Thêm viền xanh vào nút vừa bấm
                    capNhatGiaHienThi(); // Tính toán cập nhật lại bảng giá
                });
            });

            // Sự kiện Click chọn Màu sắc
            const danhSachNutMau = document.querySelectorAll('#cum-chon-mau .option-item');
            danhSachNutMau.forEach(nut => {
                nut.addEventListener('click', () => {
                    danhSachNutMau.forEach(n => n.classList.remove('active')); // Xóa viền xanh màu cũ
                    nut.classList.add('active'); // Bật viền xanh tích v màu mới lên
                });
            });

            // Log ra console thử xem khách đang chọn option gì khi ấn Mua Ngay
            document.getElementById('btn-mua-ngay').addEventListener('click', () => {
                const banGb = document.querySelector('#cum-chon-gb .option-item.active').getAttribute('data-value');
                const banMau = document.querySelector('#cum-chon-mau .option-item.active').getAttribute('data-name');
                alert(`M vừa chọn mua: ${sp.name} - Bản: ${banGb} - Màu: ${banMau}. Chuẩn bị sang tính năng giỏ hàng nha m!`);
            });

        })
        .catch(err => {
            console.error("Lỗi tương tác rồi m ơi:", err);
        });
});


const anhChinh = document.getElementById('anh-chinh');
const danhSachAnhNho = document.querySelectorAll('#cum-anh-nho .thumbnail-item');

danhSachAnhNho.forEach(item => {
    item.addEventListener('click', () => {
        // 1. Gỡ viền đỏ (active) của cái ảnh nhỏ cũ
        danhSachAnhNho.forEach(thumb => thumb.classList.remove('active'));
        
        // 2. Thêm viền đỏ vào cái ảnh nhỏ vừa click
        item.classList.add('active');
        
        // 3. Lấy đường dẫn ảnh từ thuộc tính data-src của ảnh nhỏ
        const linkAnhMoi = item.getAttribute("https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2024/12/02/iphone-16-pro-max-tu-nhien-1.png;trim.threshold=80;trim.percentpadding=0.5;mode=pad;paddingWidth=0;");
        
        // 4. Thay thế đường dẫn của Ảnh To bằng Ảnh Mới chọn
        if (anhChinh && linkAnhMoi) {
            anhChinh.src = linkAnhMoi;
        }
    });
});