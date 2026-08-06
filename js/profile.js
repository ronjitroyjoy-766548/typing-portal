function loadUserProfile() {
    let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('loggedInUser')) || {};
    let userId = loggedInUser.userId || "N/A";
    let savedExams = JSON.parse(localStorage.getItem(`userHistory_${userId}`)) || [];
    let avatarImage = localStorage.getItem(`userSavedAvatar_${userId}`) || localStorage.getItem('userSavedAvatar') || "";

    let name = loggedInUser.fullname || "প্রার্থী";
    let post = loggedInUser.post || "কম্পিউটার অপারেটর";
    let mobile = loggedInUser.mobile || "N/A";

    if(document.getElementById('user-name')) document.getElementById('user-name').innerText = name;
    if(document.getElementById('user-post-display')) document.getElementById('user-post-display').innerText = "আবেদনকৃত পদ: " + post;
    if(document.getElementById('user-id-badge')) document.getElementById('user-id-badge').innerText = "User ID: #" + userId;
    
    if(document.getElementById('info-name')) document.getElementById('info-name').innerText = name;
    if(document.getElementById('info-username')) document.getElementById('info-username').innerText = userId;
    if(document.getElementById('info-post')) document.getElementById('info-post').innerText = post;
    if(document.getElementById('info-phone')) document.getElementById('info-phone').innerText = mobile;

    const avatarImg = document.getElementById('profile-avatar-img');
    const initialsDiv = document.getElementById('user-initials');

    if (avatarImage && avatarImg) {
        avatarImg.src = avatarImage;
        avatarImg.style.display = 'block';
        if(initialsDiv) initialsDiv.style.display = 'none';
    } else if(initialsDiv) {
        let nameParts = name.trim().split(' ');
        let initials = nameParts.length > 1 ? (nameParts[0][0] + nameParts[1][0]) : nameParts[0][0];
        initialsDiv.innerText = initials ? initials.toUpperCase() : "US";
        initialsDiv.style.display = 'flex';
        if(avatarImg) avatarImg.style.display = 'none';
    }

    const totalExams = savedExams.length;
    const passedExams = savedExams.filter(e => String(e.status).toLowerCase().includes('pass')).length;
    const failedExams = totalExams - passedExams;
    const highestWpm = totalExams > 0 ? Math.max(...savedExams.map(e => parseInt(e.wpm || e.speed || 0))) : 0;

    if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = totalExams;
    if(document.getElementById('stat-passed')) document.getElementById('stat-passed').innerText = passedExams;
    if(document.getElementById('stat-failed')) document.getElementById('stat-failed').innerText = failedExams;
    if(document.getElementById('stat-highest')) document.getElementById('stat-highest').innerText = highestWpm + " WPM";

    const historyList = document.getElementById('exam-history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';

    if (totalExams === 0) {
        historyList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 10px; display: block;"></i> আপনি এখনও কোনো পরীক্ষায় অংশ নেননি। পরীক্ষা দিতে এক্সাম পোর্টালে যান!</div>`;
        return;
    }

    savedExams.forEach(exam => {
        let isPass = String(exam.status).toLowerCase().includes('pass');
        let iconClass = isPass ? 'pass' : 'fail';
        let iconSymbol = isPass ? 'fa-check' : 'fa-xmark';
        
        historyList.innerHTML += `
            <div class="history-item">
                <div class="history-left">
                    <div class="history-icon ${iconClass}">
                        <i class="fa-solid ${iconSymbol}"></i>
                    </div>
                    <div class="history-details">
                        <h4>${escapeHTML(exam.title || 'টাইপিং টেস্ট পরীক্ষা')}</h4>
                        <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(exam.date || 'সাম্প্রতিক')}</span>
                    </div>
                </div>
                <div class="history-right">
                    <div class="metric-badge">
                        <div class="val">${exam.wpm || 0} WPM</div>
                        <div class="lbl">গতি</div>
                    </div>
                    <div class="metric-badge">
                        <div class="val">${exam.accuracy || 0}%</div>
                        <div class="lbl">নির্ভুলতা</div>
                    </div>
                    <span class="status-pill ${iconClass}">${isPass ? 'PASSED' : 'FAILED'}</span>
                </div>
            </div>
        `;
    });
}

function uploadAvatar(event) {
    const file = event.target.files[0];
    let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('loggedInUser')) || {};
    let userId = loggedInUser.userId || "default";

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem(`userSavedAvatar_${userId}`, e.target.result);
            localStorage.setItem('userSavedAvatar', e.target.result);
            loadUserProfile();
        };
        reader.readAsDataURL(file);
    }
}

function editProfileInfo() {
    let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('loggedInUser')) || {};
    if(!loggedInUser.userId) return alert("প্রোফাইল এডিট করতে লগইন করুন!");

    let newName = prompt("আপনার নতুন নাম লিখুন:", loggedInUser.fullname || "");
    let newPhone = prompt("আপনার নতুন মোবাইল নম্বর লিখুন:", loggedInUser.mobile || "");

    if (newName && newName.trim() !== "") loggedInUser.fullname = newName.trim();
    if (newPhone && newPhone.trim() !== "") loggedInUser.mobile = newPhone.trim();

    let usersData = JSON.parse(localStorage.getItem('usersData')) || {};
    if (usersData[loggedInUser.userId]) {
        usersData[loggedInUser.userId].fullname = loggedInUser.fullname;
        usersData[loggedInUser.userId].mobile = loggedInUser.mobile;
        localStorage.setItem('usersData', JSON.stringify(usersData));
    }

    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

    loadUserProfile();
}
