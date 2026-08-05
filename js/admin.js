// Admin Panel Core System

function escapeHTML(str) {
    if(!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function switchAdminTab(tabId, element) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-menu-list li').forEach(li => li.classList.remove('active'));

    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');
    if(element) element.classList.add('active');
}

function initAdminPanel() {
    renderPackagesAdmin();
    filterRequests();
    loadLiveExamSetup();
    renderAdminNotices();
    renderRegisteredUsers();
    renderAllResults();
    checkResultPubStatus();
}

// --- 1. Packages Logic ---
function addPackageAdmin() {
    const title = document.getElementById('pkgTitle').value.trim();
    const price = document.getElementById('pkgPrice').value.trim();
    const days = document.getElementById('pkgDays').value.trim();
    const features = document.getElementById('pkgFeatures').value.trim();

    let pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
    pkgs.push({
        id: Date.now(),
        title: title,
        price: price,
        days: parseInt(days),
        features: features
    });

    localStorage.setItem('appPackages', JSON.stringify(pkgs));
    alert('✅ প্যাকেজ যুক্ত হয়েছে!');
    document.getElementById('pkgTitle').value = '';
    document.getElementById('pkgPrice').value = '';
    document.getElementById('pkgDays').value = '';
    document.getElementById('pkgFeatures').value = '';
    renderPackagesAdmin();
}

function renderPackagesAdmin() {
    let pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
    const container = document.getElementById('activePackagesList');
    if(!container) return;

    container.innerHTML = pkgs.length > 0 ? pkgs.map(p => `
        <div class="pkg-item">
            <div>
                <b>${escapeHTML(p.title)}</b> — <span style="color:#16a34a; font-weight:bold;">৳${escapeHTML(p.price)}</span> (${p.days} দিন)
                <br><small style="color:#64748b;">${escapeHTML(p.features)}</small>
            </div>
            <button onclick="deletePackage(${p.id})" class="btn btn-danger" style="padding:5px 10px; font-size:12px;">ডিলিট</button>
        </div>
    `).join('') : '<p style="color:#64748b; margin-top:10px;">কোনো সক্রিয় প্যাকেজ নেই।</p>';
}

function deletePackage(id) {
    if(confirm('প্যাকেজটি মুছে ফেলতে চান?')) {
        let pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
        pkgs = pkgs.filter(p => Number(p.id) !== Number(id));
        localStorage.setItem('appPackages', JSON.stringify(pkgs));
        renderPackagesAdmin();
    }
}

// --- 2. Payment Requests Logic ---
function filterRequests() {
    const selectedDate = document.getElementById('filterDate').value;
    const searchQuery = document.getElementById('searchQuery').value.toLowerCase().trim();
    const requests = JSON.parse(localStorage.getItem('pkgRequests')) || [];

    let filtered = requests.filter(r => {
        let matchDate = !selectedDate || (r.rawDate === selectedDate);
        let matchSearch = !searchQuery || 
            (r.user && r.user.toLowerCase().includes(searchQuery)) ||
            (r.mobile && r.mobile.includes(searchQuery)) ||
            (r.trx && r.trx.toLowerCase().includes(searchQuery));
        return matchDate && matchSearch;
    });

    renderRequestsTable(filtered);
}

function resetFilter() {
    document.getElementById('filterDate').value = '';
    document.getElementById('searchQuery').value = '';
    filterRequests();
}

function renderRequestsTable(list) {
    const tbody = document.getElementById('adminPkgReqList');
    if (!tbody) return;

    tbody.innerHTML = list.length > 0 ? list.map(r => `
        <tr>
            <td>${escapeHTML(r.date || 'N/A')}</td>
            <td><b>${escapeHTML(r.user)}</b><br><small>${escapeHTML(r.mobile)}</small></td>
            <td><b>${escapeHTML(r.package)}</b><br><span style="color:#16a34a;">৳${escapeHTML(r.price)}</span> (${r.days} দিন)</td>
            <td><code>${escapeHTML(r.trx)}</code></td>
            <td>
                <span style="padding:3px 8px; border-radius:12px; font-size:12px; font-weight:bold;
                    background:${r.status === 'Approved' ? '#dcfce7' : (r.status === 'Rejected' ? '#fee2e2' : '#fef3c7')};
                    color:${r.status === 'Approved' ? '#166534' : (r.status === 'Rejected' ? '#991b1b' : '#92400e')};">
                    ${escapeHTML(r.status)}
                </span>
            </td>
            <td>
                ${r.status === 'Pending' ? `
                    <button onclick="updatePkgStatus(${r.id}, 'Approved', ${r.days})" class="btn btn-success" style="padding:4px 8px; font-size:12px;">Approve</button>
                    <button onclick="updatePkgStatus(${r.id}, 'Rejected', 0)" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">Reject</button>
                ` : '<span>সম্পন্ন</span>'}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">কোনো পেমেন্ট রিকোয়েস্ট নেই।</td></tr>';
}

function updatePkgStatus(reqId, newStatus, durationDays) {
    let requests = JSON.parse(localStorage.getItem('pkgRequests')) || [];
    const index = requests.findIndex(r => Number(r.id) === Number(reqId));

    if (index !== -1) {
        requests[index].status = newStatus;
        if(newStatus === 'Approved') {
            let expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays));
            let activeUserPkg = { packageName: requests[index].package, expiryDate: expiryDate.toISOString(), status: 'Active' };
            localStorage.setItem(`userPkg_${requests[index].mobile}`, JSON.stringify(activeUserPkg));
        }
        localStorage.setItem('pkgRequests', JSON.stringify(requests));
        alert(`পেমেন্ট ${newStatus === 'Approved' ? 'অনুমোদিত' : 'বাতিল'} করা হয়েছে!`);
        filterRequests();
    }
}

// --- 3. Live Exam Setup Logic ---
function saveLiveExamSetup() {
    const examData = {
        title: document.getElementById('examSetupTitle').value.trim(),
        examLang: document.getElementById('examSetupLang').value,
        duration: document.getElementById('examSetupDuration').value,
        passage: document.getElementById('examSetupPassage').value.trim(),
        passWpm: document.getElementById('examPassWpm').value,
        passAccuracy: document.getElementById('examPassAccuracy').value,
        status: document.getElementById('examStatus').value
    };

    localStorage.setItem('adminExamSetup', JSON.stringify(examData));
    alert('✅ লাইভ পরীক্ষার সেটিংস সফলভাবে সেভ করা হয়েছে!');
}

function loadLiveExamSetup() {
    const examData = JSON.parse(localStorage.getItem('adminExamSetup'));
    if (!examData) return;

    document.getElementById('examSetupTitle').value = examData.title || '';
    document.getElementById('examSetupLang').value = examData.examLang || 'bangla';
    document.getElementById('examSetupDuration').value = examData.duration || 5;
    document.getElementById('examSetupPassage').value = examData.passage || '';
    document.getElementById('examPassWpm').value = examData.passWpm || 20;
    document.getElementById('examPassAccuracy').value = examData.passAccuracy || 80;
    document.getElementById('examStatus').value = examData.status || 'active';
}

// --- 4. Notice Board Logic ---
function postAdminNotice() {
    const text = document.getElementById('noticeTextInput').value.trim();
    if(!text) return;

    let notices = JSON.parse(localStorage.getItem('adminNoticeList')) || [];
    notices.unshift({
        id: Date.now(),
        text: text,
        date: new Date().toLocaleDateString('bn-BD')
    });

    localStorage.setItem('adminNoticeList', JSON.stringify(notices));
    document.getElementById('noticeTextInput').value = '';
    alert('✅ নতুন নোটিশ পোস্ট করা হয়েছে!');
    renderAdminNotices();
}

function renderAdminNotices() {
    let notices = JSON.parse(localStorage.getItem('adminNoticeList')) || [];
    const container = document.getElementById('adminNoticeArchive');
    if(!container) return;

    container.innerHTML = notices.length > 0 ? notices.map(n => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:6px; margin-top:8px; display:flex; justify-between; align-items:center;">
            <div>
                <small style="color:#64748b;">📅 ${escapeHTML(n.date)}</small>
                <p style="margin-top:3px; font-weight:bold;">${escapeHTML(n.text)}</p>
            </div>
            <button onclick="deleteNotice(${n.id})" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">মুছুন</button>
        </div>
    `).join('') : '<p style="color:#64748b; margin-top:10px;">কোনো নোটিশ পোস্ট করা হয়নি।</p>';
}

function deleteNotice(id) {
    let notices = JSON.parse(localStorage.getItem('adminNoticeList')) || [];
    notices = notices.filter(n => Number(n.id) !== Number(id));
    localStorage.setItem('adminNoticeList', JSON.stringify(notices));
    renderAdminNotices();
}

// --- 5. User Management Logic ---
function renderRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('usersData')) || {};
    const tbody = document.getElementById('registeredUsersTable');
    if(!tbody) return;

    let list = Object.values(users);
    tbody.innerHTML = list.length > 0 ? list.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${escapeHTML(u.fullname)}</b></td>
            <td><code>${escapeHTML(u.userId)}</code></td>
            <td>${escapeHTML(u.post || 'N/A')}</td>
            <td>${escapeHTML(u.mobile || 'N/A')}</td>
            <td><code>${escapeHTML(u.pass)}</code></td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">কোনো নিবন্ধিত ইউজার নেই।</td></tr>';
}

// --- 6. Results Logic ---
function renderAllResults() {
    const results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    const tbody = document.getElementById('allCandidateResultsTable');
    if(!tbody) return;

    tbody.innerHTML = results.length > 0 ? results.map(r => `
        <tr>
            <td>${escapeHTML(r.date || 'আজ')}</td>
            <td><b>${escapeHTML(r.name)}</b> (${escapeHTML(r.userid)})</td>
            <td>${escapeHTML(r.title || 'লাইভ পরীক্ষা')}</td>
            <td><b>${escapeHTML(r.wpm)} WPM</b></td>
            <td>${escapeHTML(r.accuracy)}%</td>
            <td>
                <span style="color:${r.status === 'Pass' ? '#16a34a' : '#dc2626'}; font-weight:bold;">
                    ${escapeHTML(r.status)}
                </span>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">কোনো ফলাফলের ডাটা নেই।</td></tr>';
}

function toggleResultPublication(status) {
    localStorage.setItem('isResultPublished', status ? 'true' : 'false');
    checkResultPubStatus();
    alert(`ফলাফল ${status ? 'প্রকাশ করা হয়েছে' : 'গোপন/হাইড করা হয়েছে'}!`);
}

function checkResultPubStatus() {
    const isPub = localStorage.getItem('isResultPublished') === 'true';
    const badge = document.getElementById('pubStatusBadge');
    if(badge) {
        badge.innerText = isPub ? '(বর্তমান স্ট্যাটাস: প্রকাশিত)' : '(বর্তমান স্ট্যাটাস: গোপন/হাইড)';
        badge.style.color = isPub ? '#16a34a' : '#dc2626';
    }
}
function escapeHTML(str) {
    if(!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function switchAdminTab(tabId, element) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-menu-list li').forEach(li => li.classList.remove('active'));

    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');
    if(element) element.classList.add('active');
}

function initAdminPanel() {
    renderAdminExamList();
    renderAllResultsLeaderboard();
    renderPackagesAdmin();
    filterRequests();
    renderAdminNotices();
    renderRegisteredUsers();
}

// Save Exam Setup to Array
function saveLiveExamSetup() {
    const title = document.getElementById('examSetupTitle').value.trim();
    const lang = document.getElementById('examSetupLang').value;
    const duration = parseInt(document.getElementById('examSetupDuration').value);
    const passage = document.getElementById('examSetupPassage').value.trim();
    const backspace = document.getElementById('allowBackspace').value;
    const highlight = document.getElementById('allowHighlight').value;
    const passWpm = parseInt(document.getElementById('examPassWpm').value);
    const passAccuracy = parseInt(document.getElementById('examPassAccuracy').value);

    let examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    examList.push({
        id: Date.now(),
        title, lang, duration, passage, backspace, highlight, passWpm, passAccuracy
    });

    localStorage.setItem('adminExamList', JSON.stringify(examList));
    alert('✅ পরীক্ষাটি সফলভাবে তালিকায় যুক্ত করা হয়েছে!');
    renderAdminExamList();
}

function renderAdminExamList() {
    let examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    const container = document.getElementById('adminExamList');
    if(!container) return;

    container.innerHTML = examList.length > 0 ? examList.map((e, index) => `
        <div class="pkg-item">
            <div>
                <b>${index + 1}. ${escapeHTML(e.title)}</b> (${e.duration} মিনিট | ${e.lang})
                <br><small style="color:#64748b;">ব্যাকস্পেস: ${e.backspace === 'yes' ? 'চালু' : 'বন্ধ'} | হাইলাইট: ${e.highlight === 'yes' ? 'চালু' : 'বন্ধ'} | পাস WPM: ${e.passWpm}</small>
            </div>
            <button onclick="deleteExam(${e.id})" class="btn btn-danger" style="padding:5px 10px; font-size:12px;">ডিলিট</button>
        </div>
    `).join('') : '<p style="color:#64748b; margin-top:10px;">কোনো পরীক্ষা সেটিং করা নেই।</p>';
}

function deleteExam(id) {
    if(confirm('পরীক্ষাটি তালিকা থেকে মুছে ফেলতে চান?')) {
        let examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
        examList = examList.filter(e => Number(e.id) !== Number(id));
        localStorage.setItem('adminExamList', JSON.stringify(examList));
        renderAdminExamList();
    }
}

// Render Results with Rank / Leaderboard
function renderAllResultsLeaderboard() {
    let results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    const tbody = document.getElementById('allCandidateResultsTable');
    if(!tbody) return;

    // Sort by WPM descending for rank/leaderboard
    results.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);

    tbody.innerHTML = results.length > 0 ? results.map((r, i) => `
        <tr>
            <td><b style="color:#0284c7;">#${i + 1}</b></td>
            <td><b>${escapeHTML(r.name)}</b><br><small>${escapeHTML(r.userId)}</small></td>
            <td>${escapeHTML(r.district || 'N/A')}</td>
            <td>${escapeHTML(r.mobile || 'N/A')}</td>
            <td><b>${r.wpm} WPM</b></td>
            <td>${r.accuracy}%</td>
            <td>
                <span style="color:${r.status === 'পাস (Passed)' ? '#16a34a' : '#dc2626'}; font-weight:bold;">
                    ${escapeHTML(r.status)}
                </span>
            </td>
            <td><small>${escapeHTML(r.date)}</small></td>
        </tr>
    `).join('') : '<tr><td colspan="8" style="text-align:center;">কোনো ফলাফলের ডাটা নেই।</td></tr>';
}

function toggleResultPublication(status) {
    localStorage.setItem('isResultPublished', status ? 'true' : 'false');
    const badge = document.getElementById('pubStatusBadge');
    if(badge) {
        badge.innerText = status ? '(স্ট্যাটাস: প্রকাশিত)' : '(স্ট্যাটাস: গোপন)';
        badge.style.color = status ? '#16a34a' : '#dc2626';
    }
    alert(`ফলাফল ${status ? 'প্রকাশ' : 'গোপন'} করা হয়েছে!`);
}

// General Utilities
function addPackageAdmin() { /* Standard Logic */ }
function renderPackagesAdmin() { /* Standard Logic */ }
function filterRequests() { /* Standard Logic */ }
function renderAdminNotices() { /* Standard Logic */ }
function postAdminNotice() { /* Standard Logic */ }
function renderRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('usersData')) || {};
    const tbody = document.getElementById('registeredUsersTable');
    if(!tbody) return;
    let list = Object.values(users);
    tbody.innerHTML = list.map((u, i) => `
        <tr><td>${i+1}</td><td><b>${escapeHTML(u.fullname)}</b></td><td><code>${escapeHTML(u.userId)}</code></td><td>${escapeHTML(u.district || 'ঢাকা')}</td><td>${escapeHTML(u.mobile)}</td></tr>
    `).join('');
}
