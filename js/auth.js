// Auth & Guard Management System (Secured)

if (!localStorage.getItem('usersData')) {
    const defaultUsers = {
        "admin": { fullname: "সিস্টেম অ্যাডমিন", post: "অ্যাডমিনিস্ট্রেটর", mobile: "01700000000", pass: "123456", userId: "admin", role: "admin" }
    };
    localStorage.setItem('usersData', JSON.stringify(defaultUsers));
}

function checkAuthGuard() {
    const currentPage = window.location.pathname.split("/").pop();
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = "index.html";
        return;
    }

    if (currentPage === 'admin.html' && loggedInUser && loggedInUser.userId !== 'admin') {
        alert("⚠️ আপনার এই পেজে প্রবেশের অনুমতি নেই!");
        window.location.href = "portal.html";
    }
}

function logoutUser() {
    sessionStorage.clear();
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
}

function openModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'flex'; 
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'none'; 
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('usersData')) || {};

    if (users[user] && users[user].pass === pass) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(users[user]));
        localStorage.setItem('loggedInUser', JSON.stringify(users[user]));
        window.location.href = (user === 'admin') ? "admin.html" : "portal.html"; 
    } else {
        const errBox = document.getElementById('login-error');
        if(errBox) errBox.style.display = "block";
    }
}

function handleRegister(event) {
    event.preventDefault();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const post = document.getElementById('reg-post').value;
    const mobile = document.getElementById('reg-mobile').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    let users = JSON.parse(localStorage.getItem('usersData')) || {};

    if (users[username]) {
        alert("❌ এই ইউজার আইডিটি ইতিমধ্যে নিবন্ধিত!");
    } else {
        const newUser = { fullname, post, mobile, pass: password, userId: username, role: "user" };
        users[username] = newUser;
        localStorage.setItem('usersData', JSON.stringify(users));
        sessionStorage.setItem('loggedInUser', JSON.stringify(newUser));
        localStorage.setItem('loggedInUser', JSON.stringify(newUser));
        alert("✅ রেজিস্ট্রেশন সফল হয়েছে!");
        window.location.href = "portal.html";
    }
}

function showResetFields() {
    const searchUser = document.getElementById('forgot-username').value.trim();
    const users = JSON.parse(localStorage.getItem('usersData')) || {};
    if (!searchUser || !users[searchUser]) return alert("⚠️ সঠিক ইউজার আইডি প্রদান করুন!");
    document.getElementById('reset-section').style.display = "block";
}

function saveNewPassword() {
    const searchUser = document.getElementById('forgot-username').value.trim();
    const newPass = document.getElementById('new-password').value.trim();
    let users = JSON.parse(localStorage.getItem('usersData')) || {};
    if (!newPass) return alert("⚠️ নতুন পাসওয়ার্ড দিন!");

    if (users[searchUser]) {
        users[searchUser].pass = newPass;
        localStorage.setItem('usersData', JSON.stringify(users));
        alert("✅ পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!");
        closeModal('forgotModal');
    }
}
