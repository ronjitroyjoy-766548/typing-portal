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
            <p>⏱️ সময়: ${e.duration} মিনিট | 🌐 ভাষা: ${e.lang}</p>
            <p><small>পাস করার জন্য WPM: ${e.passWpm} | ব্যাকস্পেস: ${e.backspace === 'yes' ? 'অনুমোদিত' : 'নিষেধ'}</small></p>
            <button onclick="openVerifyModal(${e.id})" class="btn btn-primary" style="margin-top:10px;">পরীক্ষায় অংশ নিন</button>
        </div>
    `).join('') : '<p style="color:#64748b;">বর্তমানে কোনো সক্রিয় পরীক্ষা নেই। এডমিন সেটআপ করলে এখানে দেখাবে।</p>';
}

function openVerifyModal(examId) {
    const examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    selectedExam = examList.find(e => Number(e.id) === Number(examId));
    document.getElementById('verifyModal').style.display = 'flex';
}

function closeVerifyModal() {
    document.getElementById('verifyModal').style.display = 'none';
}

function verifyAndStartExam() {
    const userId = document.getElementById('verifyUserId').value.trim();
    const mobile = document.getElementById('verifyMobile').value.trim();
    const users = JSON.parse(localStorage.getItem('usersData')) || {};

    if (users[userId] && users[userId].mobile === mobile) {
        currentCandidate = users[userId];
        closeVerifyModal();
        startExamEnvironment();
    } else {
        alert("❌ আইডি বা ফোন নম্বর সঠিক নয়! অনুগ্রহ করে সঠিকভাবে নাম ও তথ্য দিয়ে আইডিটি নিশ্চিত করুন।");
    }
}

function startExamEnvironment() {
    document.getElementById('examSelectView').style.display = 'none';
    document.getElementById('examAreaView').style.display = 'block';

    document.getElementById('exUserId').innerText = currentCandidate.userId;
    document.getElementById('exUserName').innerText = currentCandidate.fullname;
    document.getElementById('exUserDistrict').innerText = currentCandidate.district || 'ঢাকা';
    document.getElementById('currentExamTitle').innerText = selectedExam.title;

    const passageBox = document.getElementById('a4PassageBox');
    passageBox.innerText = selectedExam.passage;

    const inputField = document.getElementById('typingInputField');
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();

    // Disable Backspace if Admin Restricted
    if (selectedExam.backspace === 'no') {
        inputField.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') e.preventDefault();
        });
    }

    // Start Timer
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
        timerDisplay.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        // Color Change Alert in Last 1 Minute
        if (timeRemaining <= 60) {
            a4Paper.classList.add('warning-color');
        }

        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            alert('⏰ নির্ধারিত সময় শেষ! আপনার উত্তর স্বয়ংক্রিয়ভাবে জমা নেওয়া হচ্ছে।');
            finishExamAndCalculate();
        }
    }, 1000);
}

function finishExamAndCalculate() {
    clearInterval(examTimer);
    const inputField = document.getElementById('typingInputField');
    inputField.disabled = true;

    const typedText = inputField.value.trim();
    const originalText = selectedExam.passage.trim();

    // Calculate WPM and Accuracy
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

    // Save to LocalStorage
    let results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    const newResult = {
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
    };
    results.push(newResult);
    localStorage.setItem('candidateResults', JSON.stringify(results));

    // Show Result View
    document.getElementById('examAreaView').style.display = 'none';
    document.getElementById('resultAreaView').style.display = 'block';

    document.getElementById('resultDetailsBox').innerHTML = `
        <div style="font-size:18px; line-height:1.8;">
            <p><b>परीक्षार्थी:</b> ${currentCandidate.fullname} (${currentCandidate.userId})</p>
            <p><b>জেলা:</b> ${currentCandidate.district || 'ঢাকা'}</p>
            <p><b>গতি (Speed):</b> <span style="color:#0284c7; font-size:22px; font-weight:bold;">${wpm} WPM</span></p>
            <p><b>নির্ভুলতা (Accuracy):</b> <b>${accuracy}%</b></p>
            <p><b>ফলাফল:</b> <span style="color:${isPassed ? '#16a34a' : '#dc2626'}; font-weight:bold; font-size:20px;">${resultStatus}</span></p>
        </div>
    `;
}
