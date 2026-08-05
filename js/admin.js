// Admin Panel Management System
function addPackageAdmin() {
    const title = document.getElementById('pkgTitle').value.trim();
    const price = document.getElementById('pkgPrice').value.trim();
    const days = document.getElementById('pkgDays').value.trim();
    const features = document.getElementById('pkgFeatures').value.trim();

    if(!title || !price || !days) return alert('❌ দয়া করে প্যাকেজের নাম, মূল্য ও মেয়াদ দিন!');

    let pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
    pkgs.push({
        id: Date.now(),
        title: title,
        price: price,
        days: parseInt(days),
        features: features.split(',').map(f => f.trim()).join(', ')
    });

    localStorage.setItem('appPackages', JSON.stringify(pkgs));
    alert('✅ প্যাকেজ সফলভাবে যুক্ত করা হয়েছে!');
    
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

    if(pkgs.length === 0) {
        container.innerHTML = `<p style="color:#777; margin-top:10px;">কোনো প্যাকেজ তৈরি করা হয়নি।</p>`;
        return;
    }

    container.innerHTML = pkgs.map(p => `
        <div class="pkg-item">
            <div>
                <b>${p.title}</b> — <span style="color:#28a745;">৳${p.price}</span> (${p.days} দিন)
                <br><small style="color:#666;">সুবিধা: ${p.features}</small>
            </div>
            <button onclick="deletePackage(${p.id})" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">ডিলিট</button>
        </div>
    `).join('');
}

function deletePackage(id) {
    if(confirm('আপনি কি এই প্যাকেজটি মুছে ফেলতে চান?')) {
        let pkgs = JSON.parse(localStorage.getItem('appPackages')) || [];
        pkgs = pkgs.filter(p => p.id !== id);
        localStorage.setItem('appPackages', JSON.stringify(pkgs));
        renderPackagesAdmin();
    }
}

function filterRequests() {
    const selectedDate = document.getElementById('filterDate').value;
    const searchQuery = document.getElementById('searchQuery').value.toLowerCase().trim();
    const requests = JSON.parse(localStorage.getItem('pkgRequests')) || [];

    let filtered = requests.filter(r => {
        let matchDate = true;
        if (selectedDate) {
            const reqDate = r.rawDate || new Date(r.id).toISOString().split('T')[0];
            matchDate = (reqDate === selectedDate);
        }

        let matchSearch = true;
        if (searchQuery) {
            matchSearch = (r.user && r.user.toLowerCase().includes(searchQuery)) ||
                          (r.mobile && r.mobile.includes(searchQuery)) ||
                          (r.trx && r.trx.toLowerCase().includes(searchQuery));
        }

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
            <td>${r.date || 'N/A'}</td>
            <td><b>${r.user}</b><br><small>${r.mobile}</small></td>
            <td><b>${r.package}</b><br><span style="color:#16a34a;">৳${r.price}</span> (${r.days || 30} দিন)</td>
            <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:bold;">${r.trx}</code></td>
            <td>
                <span style="padding:3px 8px; border-radius:12px; font-size:12px; font-weight:bold; 
                    background:${r.status === 'Approved' ? '#dcfce7' : (r.status === 'Rejected' ? '#fee2e2' : '#fef3c7')};
                    color:${r.status === 'Approved' ? '#166534' : (r.status === 'Rejected' ? '#991b1b' : '#92400e')};">
                    ${r.status}
                </span>
            </td>
            <td>
                ${r.status === 'Pending' ? `
                    <button onclick="updatePkgStatus(${r.id}, 'Approved', ${r.days || 30})" style="background:#22c55e; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Approve</button>
                    <button onclick="updatePkgStatus(${r.id}, 'Rejected', 0)" style="background:#ef4444; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Reject</button>
                ` : '<span>সম্পন্ন</span>'}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">কোনো পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।</td></tr>';
}

function updatePkgStatus(reqId, newStatus, durationDays) {
    let requests = JSON.parse(localStorage.getItem('pkgRequests')) || [];
    const index = requests.findIndex(r => r.id === reqId);

    if (index !== -1) {
        requests[index].status = newStatus;

        if(newStatus === 'Approved') {
            let expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays));
            requests[index].expiryDate = expiryDate.toISOString();

            let activeUserPkg = {
                packageName: requests[index].package,
                expiryDate: expiryDate.toISOString(),
                status: 'Active'
            };
            localStorage.setItem(`userPkg_${requests[index].mobile}`, JSON.stringify(activeUserPkg));
        }

        localStorage.setItem('pkgRequests', JSON.stringify(requests));
        alert(`পেমেন্ট রিকোয়েস্টটি ${newStatus === 'Approved' ? 'এপ্রুভ করা হয়েছে এবং মেয়াদ যুক্ত হয়েছে!' : 'রিজেক্ট করা হয়েছে'}`);
        filterRequests();
    }
}
