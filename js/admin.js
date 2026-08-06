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
    alert('✅ পরীক্ষাটি সফলভাবে তালিকায় যুক্ত করা হয়েছে!');
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
    alert(`ফলাফল ${status ? 'প্রকাশ' : 'গোপন'} করা হয়েছে!`);
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
