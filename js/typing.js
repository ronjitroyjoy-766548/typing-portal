// Typing Engine & Portal Scripts
function toggleMenu() {
    document.getElementById('sideDrawer').classList.toggle('active');
    document.getElementById('drawerBackdrop').classList.toggle('active');
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    const target = document.getElementById(tabId);
    if(target) target.style.display = 'block';

    if(tabId === 'packagesTab') loadPackagesPortal();
    if(tabId === 'resultsTab') checkAndShowResult();
    if(tabId === 'noticeboardTab') renderFullNoticeArchive();
}

function switchPortal(type) {
    showTab(type === 'practice' ? 'practice-portal-section' : 'exam-portal-section');
    if(type === 'exam') checkLiveExam();
}

function syncUserDataUI() {
    const user = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(sessionStorage.getItem('loggedInUser')) || { fullname: 'পরীক্ষার্থী' };
    document.getElementById('navUserName').innerText = user.fullname;

    const avatar = localStorage.getItem('userSavedAvatar') || localStorage.getItem('profile_avatar');
    if (avatar) document.getElementById('userAvatar').src = avatar;
}

function loadAdminNotices() {
    const notices = JSON.parse(localStorage.getItem('adminNoticeList')) || [];
    const marquee = document.getElementById('noticeMarquee');
    if (marquee) {
        marquee.innerHTML = notices.length > 0 
            ? notices.map(n => `📌 [${n.date || 'নোটিশ'}] ${n.text}`).join(' &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; ')
            : "বর্তমানে কোনো অফিশিয়াল নোটিশ নেই।";
    }
}

function renderFullNoticeArchive() {
    const notices = JSON.parse(localStorage.getItem('adminNoticeList')) || [];
    const container = document.getElementById('fullNoticeList');
    if(!container) return;
    container.innerHTML = notices.length > 0 ? notices.map(n => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:6px; margin-bottom:10px;">
            <small style="color:#64748b;">📅 ${n.date || 'তারিখ নেই'}</small>
            <p style="margin-top:5px; font-weight:bold; color:#1e293b;">${n.text}</p>
        </div>
    `).join('') : '<p style="color:#64748b;">কোনো অফিশিয়াল নোটিশ পোস্ট করা হয়নি।</p>';
}

function dismissNotice() {
    document.getElementById('noticeBoardBox').style.display = 'none';
}

let currentPracText = "বাংলা আমাদের মাতৃভাষা। নিয়মিত টাইপিং অনুশীলন করলে আপনার গতি ও নির্ভুলতা বৃদ্ধি পাবে। সরকারি চাকরির পরীক্ষার জন্য ভালোভাবে প্রস্তুতি নিন।";
let isPracTesting = false;
let pracTimerInterval = null;
let pracTimeLeft = 60;

function selectPracMode(mode) {
    currentPracText = mode === 'en' 
        ? "Typing is an essential skill for modern employment. Daily practice improves both speed and accuracy significantly. Prepare well for your exams."
        : "বাংলা আমাদের মাতৃভাষা। নিয়মিত টাইপিং অনুশীলন করলে আপনার গতি ও নির্ভুলতা বৃদ্ধি পাবে। সরকারি চাকরির পরীক্ষার জন্য ভালোভাবে প্রস্তুতি নিন।";
    resetPracText();
}

function resetPracText() {
    clearInterval(pracTimerInterval);
    isPracTesting = false;
    document.getElementById("pracTypingInput").value = "";
    document.getElementById("pracTypingInput").disabled = true;
    document.getElementById("pracActionArea").style.display = "block";
    document.getElementById("pracWpm").innerText = "0";
    document.getElementById("pracAccuracy").innerText = "100";
    
    let mins = parseInt(document.getElementById("pracTimeInput").value) || 1;
    pracTimeLeft = mins * 60;
    document.getElementById("pracTimer").innerText = `${mins < 10 ? '0' : ''}${mins}:00`;
    displayPracText();
}

function displayPracText() {
    const display = document.getElementById("pracTextDisplay");
    display.innerHTML = "";
    currentPracText.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        display.appendChild(span);
    });
}

function startPracTest() {
    isPracTesting = true;
    document.getElementById("pracTypingInput").disabled = false;
    document.getElementById("pracTypingInput").focus();
    document.getElementById("pracActionArea").style.display = "none";
    pracTimerInterval = setInterval(updatePracTimer, 1000);
}

function handlePracTyping() {
    const spans = document.getElementById("pracTextDisplay").querySelectorAll("span");
    const typed = document.getElementById("pracTypingInput").value.split("");
    let correct = 0;

    spans.forEach((span, i) => {
        if (typed[i] == null) {
            span.className = "";
        } else if (typed[i] === span.innerText) {
            span.className = "highlight-correct";
            correct++;
        } else {
            span.className = "highlight-incorrect";
        }
    });

    let accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    document.getElementById("pracAccuracy").innerText = accuracy;
    
    let words = typed.length / 5;
    let elapsedMins = ((parseInt(document.getElementById("pracTimeInput").value) * 60) - pracTimeLeft) / 60;
    let wpm = elapsedMins > 0 ? Math.round(words / elapsedMins) : 0;
    document.getElementById("pracWpm").innerText = wpm;
}

function updatePracTimer() {
    if (pracTimeLeft > 0) {
        pracTimeLeft--;
        let mins = Math.floor(pracTimeLeft / 60);
        let secs = pracTimeLeft % 60;
        document.getElementById("pracTimer").innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
        clearInterval(pracTimerInterval);
        document.getElementById("pracTypingInput").disabled = true;
        document.getElementById("pracActionArea").style.display = "block";
        alert("⏰ সময় শেষ হয়েছে!");
    }
}

let examTimerInterval = null;
let examTimeLeft = 0;

function checkLiveExam() {
    const examData = JSON.parse(localStorage.getItem('adminExamSetup'));
    const container = document.getElementById('examContainer');

    if (!examData || examData.status !== 'active') {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <i class="fas fa-exclamation-circle" style="font-size: 40px; color: #f59e0b;"></i>
                <h3 style="margin-top:10px; color:#475569;">বর্তমানে কোনো পরীক্ষা লাইভ নেই।</h3>
                <p style="font-size:13px; color:#94a3b8;">অ্যাডমিন নতুন পরীক্ষা চালু করলে এখানে দেখতে পাবেন।</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="prac-controls">
            <div><b>ধরন:</b> ${examData.examType} (${examData.examLang === 'bangla' ? 'বাংলা' : 'English'})</div>
            <div><b>সময়:</b> ${examData.duration} মিনিট</div>
        </div>
        <div id="examTextDisplay" class="prac-text-display" style="margin-top:15px;">${examData.passage}</div>
        <textarea id="examTypingInput" class="prac-typing-input" style="margin-top:15px;" placeholder="পরীক্ষা শুরু হলে টাইপ করুন..." disabled></textarea>
        
        <div class="prac-stats" style="margin-top:15px;">
            <div>সময় বাকি: <span id="examTimer">00:00</span></div>
            <div>স্পিড: <span id="examWpm">0</span> WPM</div>
            <div>একুরেসি: <span id="examAccuracy">100</span>%</div>
        </div>
        
        <button id="startExamBtn" onclick="startLiveExam(${examData.duration})" style="margin-top:15px; width:100%; padding:12px; background:#28a745; color:#fff; font-size:16px; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">🚀 পরীক্ষা শুরু করুন</button>
        <button id="submitExamBtn" onclick="submitLiveExam()" style="margin-top:15px; width:100%; padding:12px; background:#dc3545; color:#fff; font-size:16px; font-weight:bold; border:none; border-radius:6px; cursor:pointer; display:none;">📥 পরীক্ষা সাবমিট করুন</button>
    `;

    const display = document.getElementById("examTextDisplay");
    display.innerHTML = "";
    examData.passage.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        display.appendChild(span);
    });
}

function startLiveExam(durationMins) {
    document.getElementById('startExamBtn').style.display = 'none';
    document.getElementById('submitExamBtn').style.display = 'block';
    
    const input = document.getElementById('examTypingInput');
    input.disabled = false;
    input.focus();

    examTimeLeft = durationMins * 60;
    examTimerInterval = setInterval(updateExamTimer, 1000);

    input.oninput = function() {
        const spans = document.getElementById("examTextDisplay").querySelectorAll("span");
        const typed = input.value.split("");
        let correct = 0;

        spans.forEach((span, i) => {
            if (typed[i] == null) {
                span.className = "";
            } else if (typed[i] === span.innerText) {
                span.className = "highlight-correct";
                correct++;
            } else {
                span.className = "highlight-incorrect";
            }
        });

        let accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
        document.getElementById("examAccuracy").innerText = accuracy;

        let words = typed.length / 5;
        let elapsedMins = ((durationMins * 60) - examTimeLeft) / 60;
        let wpm = elapsedMins > 0 ? Math.round(words / elapsedMins) : 0;
        document.getElementById("examWpm").innerText = wpm;
    };
}

function updateExamTimer() {
    if (examTimeLeft > 0) {
        examTimeLeft--;
        let mins = Math.floor(examTimeLeft / 60);
        let secs = examTimeLeft % 60;
        document.getElementById("examTimer").innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
        submitLiveExam();
    }
}

function submitLiveExam() {
    clearInterval(examTimerInterval);
    const wpm = document.getElementById("examWpm").innerText;
    const accuracy = document.getElementById("examAccuracy").innerText;
    const user = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(sessionStorage.getItem('loggedInUser')) || { fullname: 'পরীক্ষার্থী', mobile: 'N/A', userId: 'N/A' };

    const resultObj = {
        id: Date.now(),
        name: user.fullname,
        mobile: user.mobile,
        userid: user.userId,
        title: 'লাইভ টাইপিং পরীক্ষা',
        wpm: wpm,
        accuracy: accuracy,
        status: parseInt(wpm) >= 20 && parseInt(accuracy) >= 80 ? 'Pass' : 'Fail',
        date: new Date().toLocaleDateString('bn-BD')
    };

    let allResults = JSON.parse(localStorage.getItem('candidateResults')) || [];
    allResults.unshift(resultObj);
    localStorage.setItem('candidateResults', JSON.stringify(allResults));

    let userHistory = JSON.parse(localStorage.getItem(`userHistory_${user.userId}`)) || [];
    userHistory.unshift(resultObj);
    localStorage.setItem(`userHistory_${user.userId}`, JSON.stringify(userHistory));

    alert("✅ পরীক্ষা সফলভাবে সাবমিট হয়েছে!");
    showTab('resultsTab');
}

function checkAndShowResult() {
    const isPublished = localStorage.getItem('isResultPublished') === 'true';
    const statusMsg = document.getElementById('resultStatusMessage');
    const resultTable = document.getElementById('resultTable');
    const tbody = document.getElementById('userResultList');

    if (!isPublished) {
        statusMsg.innerHTML = "🔒 ফলাফল এখনো প্রকাশ করা হয়নি। অ্যাডমিন রেজাল্ট প্রকাশ করলে দেখতে পাবেন।";
        statusMsg.style.color = "#dc3545";
        resultTable.style.display = 'none';
        return;
    }

    statusMsg.innerHTML = "✅ সকল প্রকাশ্য ফলাফলের তালিকা:";
    statusMsg.style.color = "#28a745";
    resultTable.style.display = 'table';

    const results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    tbody.innerHTML = results.length > 0 ? results.map((res, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${res.name}</b> (${res.userid})</td>
            <td><b>${res.wpm} WPM</b> (${res.accuracy}% Accuracy)</td>
            <td>${res.date || 'আজ'}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center;">কোনো রেজাল্ট পাওয়া যায়নি।</td></tr>';
}

function loadPackagesPortal() {
    const pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
    const container = document.getElementById('userPackagesContainer');
    if (!container) return;

    container.innerHTML = pkgs.length > 0 ? pkgs.map(p => `
        <div style="border:1px solid #cbd5e1; padding:15px; border-radius:8px; background:#fff; width:250px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
            <h3 style="color:#1e293b; margin-bottom:5px;">${p.title}</h3>
            <h2 style="color:#16a34a; margin:8px 0;">৳ ${p.price}</h2>
            <p style="font-size:13px; color:#64748b; min-height:40px;">${p.features}</p>
            <button onclick="requestPackage('${p.title}', '${p.price}', ${p.days || 30})" style="margin-top:15px; width:100%; padding:9px; background:#2563eb; color:#fff; font-weight:bold; border:none; border-radius:5px; cursor:pointer;">💳 ক্রয় করুন</button>
        </div>
    `).join('') : '<p style="font-size:13px; color:#64748b;">বর্তমানে কোনো প্যাকেজ উপলব্ধ নেই।</p>';
}

function requestPackage(title, price, days) {
    const bkashNo = '০১৭২২২৪৩৬৫৬ (bKash/Nagad Personal)';
    const user = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(sessionStorage.getItem('loggedInUser')) || { fullname: 'ইউজার', mobile: 'N/A' };

    const promptMsg = `📦 প্যাকেজ: ${title}\n💰 মূল্য: ৳${price}\n⏱️ মেয়াদ: ${days} দিন\n\n📲 আমাদের পেমেন্ট নম্বর: ${bkashNo}\n\nটাকা পাঠানোর পর আপনার TrxID (ট্রানজেকশন আইডি) নিচে লিখুন:`;
    const trx = prompt(promptMsg);

    if (trx === null) return; 

    if (!trx.trim()) {
        alert('⚠️ ভুল ট্রানজেকশন আইডি! অনুরোধ বাতিল করা হয়েছে।');
        return;
    }

    let requests = JSON.parse(localStorage.getItem('pkgRequests')) || [];
    
    const now = new Date();
    const newReq = {
        id: Date.now(),
        user: user.fullname,
        mobile: user.mobile || 'N/A',
        package: title,
        price: price,
        days: days,
        trx: trx.trim(),
        status: 'Pending',
        date: now.toLocaleDateString('bn-BD'),
        rawDate: now.toISOString().split('T')[0]
    };

    requests.push(newReq);
    localStorage.setItem('pkgRequests', JSON.stringify(requests));

    alert('✅ আপনার পেমেন্ট অনুরোধ অ্যাডমিনের নিকট পাঠানো হয়েছে! অ্যাডমিন যাচাই করে দ্রুত এপ্রুভ করবেন।');
}
