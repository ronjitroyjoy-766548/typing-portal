let selectedExam = null;
let currentCandidate = null;
let examTimer = null;
let timeRemaining = 0;

function initPortal() {
    renderAvailableExams();
}

function renderAvailableExams() {
    const examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    const container = document.getElementById('availableExamsList');
    if(!container) return;

    container.innerHTML = examList.length > 0 ? examList.map(e => `
        <div class="exam-card-item">
            <h3>${escapeHTML(e.title)}</h3>
            <p style="font-size:13px; color:#64748b; margin:6px 0;">⏱️ সময়: ${e.duration} মিনিট | 🌐 ভাষা: ${e.lang}</p>
            <p style="font-size:12px; color:#334155;"><small>পাস WPM: ${e.passWpm} | ব্যাকস্পেস: ${e.backspace === 'yes' ? 'অনুমোদিত' : 'নিষেধ'}</small></p>
            <button onclick="openVerifyModal(${e.id})" class="btn btn-primary full-width" style="margin-top:12px;">পরীক্ষায় অংশ নিন</button>
        </div>
    `).join('') : '<p style="color:#64748b; grid-column: 1/-1;">বর্তমানে কোনো সক্রিয় পরীক্ষা নেই। এডমিন সেটআপ করলে এখানে দেখাবে।</p>';
}

function openVerifyModal(examId) {
    const examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    selectedExam = examList.find(e => Number(e.id) === Number(examId));
    
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('loggedInUser'));
    if(loggedInUser) {
        if(document.getElementById('verifyUserId')) document.getElementById('verifyUserId').value = loggedInUser.userId || '';
        if(document.getElementById('verifyMobile')) document.getElementById('verifyMobile').value = loggedInUser.mobile || '';
    }
    
    const modal = document.getElementById('verifyModal');
    if(modal) modal.style.display = 'flex';
}

function closeVerifyModal() {
    const modal = document.getElementById('verifyModal');
    if(modal) modal.style.display = 'none';
}

function verifyAndStartExam() {
    const userIdInput = document.getElementById('verifyUserId').value.trim();
    const mobileInput = document.getElementById('verifyMobile').value.trim();
    const users = JSON.parse(localStorage.getItem('usersData')) || {};

    if (users[userIdInput] && users[userIdInput].mobile === mobileInput) {
        currentCandidate = users[userIdInput];
        closeVerifyModal();
        startExamEnvironment();
    } else {
        alert("❌ আইডি বা ফোন নম্বর সঠিক নয়! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।");
    }
}

function startExamEnvironment() {
    document.getElementById('examSelectView').style.display = 'none';
    document.getElementById('examAreaView').style.display = 'block';

    document.getElementById('exUserId').innerText = currentCandidate.userId;
    document.getElementById('exUserName').innerText = currentCandidate.fullname;
    if(document.getElementById('exUserDistrict')) {
        document.getElementById('exUserDistrict').innerText = currentCandidate.district || 'ঢাকা';
    }
    document.getElementById('currentExamTitle').innerText = selectedExam.title;

    const passageBox = document.getElementById('a4PassageBox');
    passageBox.innerText = selectedExam.passage;

    const inputField = document.getElementById('typingInputField');
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();

    if (selectedExam.backspace === 'no') {
        inputField.onkeydown = function(e) {
            if (e.key === 'Backspace') {
                e.preventDefault();
                return false;
            }
        };
    } else {
        inputField.onkeydown = null;
    }

    timeRemaining = selectedExam.duration * 60;
    runCountdown();
}

function runCountdown() {
    const timerDisplay = document.getElementById('timerCountdown');
    const a4Paper = document.getElementById('a4Paper');

    examTimer = setInterval(() => {
        timeRemaining--;
        let mins = Math.floor(timeRemaining / 60);
        let secs = timeRemaining % 60;
        if(timerDisplay) timerDisplay.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (timeRemaining <= 60 && a4Paper) {
            a4Paper.classList.add('warning-color');
        }

        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            alert('⏰ নির্ধারিত সময় শেষ! আপনার উত্তর স্বয়ংক্রিয়ভাবে জমা নেওয়া হচ্ছে।');
            finishExamAndCalculate();
        }
    }, 1000);
}

function finishExamAndCalculate() {
    clearInterval(examTimer);
    const inputField = document.getElementById('typingInputField');
    if(inputField) inputField.disabled = true;

    const typedText = inputField ? inputField.value.trim() : "";
    const originalText = selectedExam.passage.trim();

    const wordsTyped = typedText.length > 0 ? typedText.split(/\s+/).length : 0;
    const timeSpentMinutes = (selectedExam.duration * 60 - timeRemaining) / 60 || 1;
    const wpm = Math.round(wordsTyped / timeSpentMinutes);

    let correctChars = 0;
    for(let i = 0; i < Math.min(typedText.length, originalText.length); i++) {
        if(typedText[i] === originalText[i]) correctChars++;
    }
    const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 0;

    const isPassed = wpm >= selectedExam.passWpm && accuracy >= selectedExam.passAccuracy;
    const resultStatus = isPassed ? 'পাস (Passed)' : 'ফেল (Failed)';

    let results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    results.push({
        id: Date.now(),
        name: currentCandidate.fullname,
        userId: currentCandidate.userId,
        district: currentCandidate.district || 'ঢাকা',
        mobile: currentCandidate.mobile,
        examTitle: selectedExam.title,
        wpm: wpm,
        accuracy: accuracy,
        status: resultStatus,
        date: new Date().toLocaleDateString('bn-BD')
    });
    localStorage.setItem('candidateResults', JSON.stringify(results));

    let userHistory = JSON.parse(localStorage.getItem(`userHistory_${currentCandidate.userId}`)) || [];
    userHistory.unshift({
        title: selectedExam.title,
        wpm: wpm,
        accuracy: accuracy,
        status: isPassed ? 'Pass' : 'Fail',
        date: new Date().toLocaleDateString('bn-BD')
    });
    localStorage.setItem(`userHistory_${currentCandidate.userId}`, JSON.stringify(userHistory));

    document.getElementById('examAreaView').style.display = 'none';
    document.getElementById('resultAreaView').style.display = 'block';

    document.getElementById('resultDetailsBox').innerHTML = `
        <div style="font-size:16px; line-height:1.8; text-align:left; background:#f8fafc; padding:20px; border-radius:8px;">
            <p><b>পরীক্ষার্থী:</b> ${escapeHTML(currentCandidate.fullname)} (${escapeHTML(currentCandidate.userId)})</p>
            <p><b>জেলা:</b> ${escapeHTML(currentCandidate.district || 'ঢাকা')}</p>
            <p><b>গতি (Speed):</b> <span style="color:#0284c7; font-size:20px; font-weight:bold;">${wpm} WPM</span></p>
            <p><b>নির্ভুলতা (Accuracy):</b> <b>${accuracy}%</b></p>
            <p><b>ফলাফল:</b> <span style="color:${isPassed ? '#16a34a' : '#dc2626'}; font-weight:bold; font-size:18px;">${resultStatus}</span></p>
        </div>
    `;
}
