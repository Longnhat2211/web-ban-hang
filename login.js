// ================= CHUYỂN ĐỔI FORM (ĐĂNG NHẬP <-> ĐĂNG KÝ) =================
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const linkShowRegister = document.getElementById('show-register');
const linkShowLogin = document.getElementById('show-login');

linkShowRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
});

linkShowLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// ================= XỬ LÝ ĐĂNG KÝ GỬI LÊN BACKEND =================
document.getElementById('btn-register').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (!fullname || !username || !password || !confirmPassword) {
        return alert("Vui lòng điền đầy đủ thông tin đăng ký!");
    }
    if (password !== confirmPassword) {
        return alert("Mật khẩu xác nhận không khớp!");
    }
    if (password.length < 6) {
        return alert("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    try {
        // Gửi API Đăng ký lên Backend
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, username, password })
        });
        
        const data = await response.json();

        if (data.success) {
            alert(data.message); // Đăng ký thành công
            // Tự điền SĐT vào form đăng nhập và chuyển form
            document.getElementById('login-username').value = username;
            document.getElementById('reg-password').value = '';
            document.getElementById('reg-confirm-password').value = '';
            linkShowLogin.click(); 
        } else {
            alert(data.message); // Báo lỗi tài khoản đã tồn tại
        }
    } catch (error) {
        alert("Lỗi kết nối đến Backend. Hãy chắc chắn bạn đã chạy file server.js");
        console.error(error);
    }
});

// ================= XỬ LÝ ĐĂNG NHẬP GỬI LÊN BACKEND =================
document.getElementById('btn-login').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        return alert("Vui lòng nhập đầy đủ thông tin!");
    }

    try {
        // Gửi API Đăng nhập lên Backend
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Chào mừng ${data.user.fullname}! Bạn đã đăng nhập thành công.`);
            // Có thể lưu một token hoặc tên user vào localStorage để đánh dấu phiên đăng nhập
            localStorage.setItem('currentUser', data.user.fullname);
            window.location.href = 'home.html'; 
        } else {
            alert(data.message); // Sai tài khoản mật khẩu
        }
    } catch (error) {
        alert("Không thể kết nối đến Backend. Đảm bảo server đang chạy nhé!");
        console.error(error);
    }
});