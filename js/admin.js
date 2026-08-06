function initAdminDashboard() {
    renderCreatedExams();
    renderMeritList();
}

function handleCreateExam(e) {
    e.preventDefault();
    const title = document.getElementById('examTitle').value.trim();
    const duration = parseInt(document.getElementById('examDuration').value);
    const lang = document.getElementById('examLang').value;
    const passWpm = parseInt(document.getElementById('passWpm').value);
    const passAccuracy = parseInt(document.getElementById('passAccuracy').value);
    const backspace = document.getElementById('allowBackspace').value;
    const passage = document.getElementById('examPassage').value.trim();

    const newExam = {
        id: Date.now(),
        title, duration, lang, passWpm, passAccuracy, backspace, passage
    };

    let examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    examList.push(newExam);
    localStorage.setItem('adminExamList', JSON.stringify(examList));

    alert("✅ পরীক্ষা সফলভাবে তৈরি ও প্রকাশ করা হয়েছে!");
    e.target.reset();
    renderCreatedExams();
}

function renderCreatedExams() {
    const examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    const container = document.getElementById('adminExamListDisplay');
    if(!container) return;

    if (examList.length === 0) {
        container.innerHTML = `<p style="font-size:13px; color:#64748b;">এখনও কোনো পরীক্ষা তৈরি করা হয়নি।</p>`;
        return;
    }

    container.innerHTML = examList.map(e => `
        <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="font-size:14px; font-weight:bold;">${escapeHTML(e.title)}</h4>
                <button onclick="deleteExam(${e.id})" class="btn btn-danger btn-sm">ডিলিট</button>
            </div>
            <p style="font-size:12px; color:#64748b; margin-top:4px;">⏱️ ${e.duration} মিনিট | 🌐 ${e.lang} | পাস WPM: ${e.passWpm}</p>
        </div>
    `).join('');
}

function deleteExam(id) {
    if(!confirm("আপনি কি এই পরীক্ষাটি মুছে ফেলতে চান?")) return;
    let examList = JSON.parse(localStorage.getItem('adminExamList')) || [];
    examList = examList.filter(e => Number(e.id) !== Number(id));
    localStorage.setItem('adminExamList', JSON.stringify(examList));
    renderCreatedExams();
}

function renderMeritList() {
    const results = JSON.parse(localStorage.getItem('candidateResults')) || [];
    const tbody = document.getElementById('meritTableBody');
    if(!tbody) return;

    if(results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b;">কোনো রেজাল্ট পাওয়া যায়নি।</td></tr>`;
        return;
    }

    // Sort by WPM descending
    results.sort((a,b) => b.wpm - a.wpm);

    tbody.innerHTML = results.map(r => `
        <tr>
            <td><b>${escapeHTML(r.name)}</b></td>
            <td><code>${escapeHTML(r.userId)}</code></td>
            <td>${escapeHTML(r.district || 'ঢাকা')}</td>
            <td>${escapeHTML(r.examTitle)}</td>
            <td><b style="color:#0284c7;">${r.wpm}</b></td>
            <td>${r.accuracy}%</td>
            <td><span style="color:${String(r.status).includes('পাস') || String(r.status).includes('Pass') ? '#16a34a' : '#dc2626'}; font-weight:bold;">${escapeHTML(r.status)}</span></td>
        </tr>
    `).join('');
}

function clearAllResults() {
    if(!confirm("⚠️ আপনি কি নিশ্চিত যে সকল মেধা তালিকার ফলাফল ডিলিট করতে চান?")) return;
    localStorage.removeItem('candidateResults');
    renderMeritList();
}
