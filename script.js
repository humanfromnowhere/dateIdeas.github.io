// 1. Firebase Konfigürasyonu
const firebaseConfig = {
    apiKey: "AIzaSyDRMXH9Scg88-FWDAC6eaaBKU5fjfwn7dw",
    authDomain: "date-ideas-app-ee6b5.firebaseapp.com",
    databaseURL: "https://date-ideas-app-ee6b5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "date-ideas-app-ee6b5",
    storageBucket: "date-ideas-app-ee6b5.firebasestorage.app",
    messagingSenderId: "623159578565",
    appId: "1:623159578565:web:1b2a70b0418e245cc405ac"
};

// Firebase Başlatma
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const ideasRef = database.ref('ideas');

// Global Değişkenler
let ideas = [];
let currentFilter = 'All';

const CATEGORY_EMOJIS = {
    'Cultural': '🎭', 'Games & Fun': '🎮', 'Food & Drinks': '🍕',
    'Outdoor': '🌳', 'Cozy & Indoors': '🏠', 'Creative': '🎨',
    'All': '📜', 'General': '✨'
};

// ==========================================
// A. GİRİŞ KONTROLLERİ (LOGIN / LOGOUT)
// ==========================================
auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    
    if (user) {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        loadIdeas(); 
    } else {
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    }
});

window.handleLogin = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!email || !password) {
        errorEl.innerText = "Lütfen alanları doldur! 🐾";
        return;
    }

    auth.signInWithEmailAndPassword(email, password).catch(error => {
        errorEl.innerText = "Hatalı giriş! Şifreni kontrol et. 🥺";
    });
};

window.handleLogout = function() {
    if(confirm("Çıkış yapmak istiyor musun? 🐾")) auth.signOut();
};

window.togglePasswordVisibility = function() {
    const passInput = document.getElementById('login-password');
    const toggleIcon = document.querySelector('.toggle-password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleIcon.innerText = '🙈';
    } else {
        passInput.type = 'password';
        toggleIcon.innerText = '👁️';
    }
};

// ==========================================
// B. FİKİRLERİ GÖSTERME / KART OLUŞTURMA
// ==========================================
function loadIdeas() {
    ideasRef.on('value', (snapshot) => {
        const data = snapshot.val();
        ideas = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        renderIdeas();
    });
}

function renderIdeas() {
    const listContainer = document.getElementById('ideas-list');
    const doneContainer = document.getElementById('done-list');
    if (!listContainer || !doneContainer) return;

    listContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    const filtered = ideas.filter(i => currentFilter === 'All' || i.category === currentFilter);
    const pending = filtered.filter(i => !i.done);
    const done = ideas.filter(i => i.done);

    const categories = {};
    pending.forEach(idea => {
        if (!categories[idea.category]) categories[idea.category] = [];
        categories[idea.category].push(idea);
    });

    for (const cat in categories) {
        const header = document.createElement('div');
        header.className = 'category-label';
        header.innerText = `${CATEGORY_EMOJIS[cat] || '✨'} ${cat}`;
        listContainer.appendChild(header);
        
        categories[cat].forEach(idea => listContainer.appendChild(createCardElement(idea)));
    }

    done.forEach(idea => doneContainer.appendChild(createCardElement(idea)));
    document.getElementById('done-count').innerText = done.length;
}

function createCardElement(idea) {
    const template = document.getElementById('date-card-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.date-name').innerText = idea.name;
    clone.querySelector('.card-emoji').innerText = CATEGORY_EMOJIS[idea.category] || '✨';
    
    if (idea.done) {
        clone.querySelector('.date-name').style.textDecoration = "line-through";
        clone.querySelector('.date-name').style.opacity = "0.6";
        clone.querySelector('.tick-btn').classList.add('ticked');
        clone.querySelector('.tick-btn').innerText = "✓";
        const catEl = clone.querySelector('.result-cat');
        if(catEl) catEl.remove();
    } else {
        clone.querySelector('.result-cat').innerText = idea.category;
    }

    clone.querySelector('.tick-btn').onclick = () => window.toggleDone(idea.id);
    clone.querySelector('.delete-btn').onclick = () => window.deleteIdea(idea.id);

    return clone;
}

// ==========================================
// C. BUTON ETKİLEŞİMLERİ VE EKLENTİLER
// ==========================================

window.spinDate = function() {
    const activeIdeas = ideas.filter(i => !i.done);
    if (activeIdeas.length === 0) return alert("Yapılacak fikir kalmadı! 🐾");
    
    const selected = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];
    const resultCard = document.querySelector('.result-card');
    
    resultCard.innerHTML = `
        <div style="font-family:'Baloo 2'; font-size:1.8rem; color:#4a3728; margin-bottom: 5px; text-align:center;">${selected.name}</div>
        <span class="result-cat" style="background:#ffb7c5; color:white; padding: 4px 10px; border-radius: 10px; font-size: 1rem; font-weight: 800;">${selected.category}</span>
    `;
};

window.filterIdeas = function(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnText = btn.innerText;
        const isMatch = (category === 'All' && btnText === 'All') ||
                        (category === 'Games & Fun' && btnText === 'Games') ||
                        (category === 'Food & Drinks' && btnText === 'Food') ||
                        (category === btnText);
        btn.classList.toggle('active', isMatch);
    });

    const titleEl = document.getElementById('list-title');
    if (titleEl) {
        const emoji = CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS['General'];
        const titleText = category === 'All' ? 'All Ideas' : `${category} Ideas`;
        titleEl.innerText = `${emoji} ${titleText}`;
    }
    renderIdeas();
};

window.addIdea = function() {
    const nameInput = document.getElementById('idea-name');
    const catSelect = document.getElementById('idea-category');
    if (!nameInput.value.trim() || !auth.currentUser) return;
    
    ideasRef.push({ name: nameInput.value, category: catSelect.value, done: false });
    nameInput.value = "";
};

window.toggleDone = function(id) {
    if (!auth.currentUser) return;
    const idea = ideas.find(i => i.id === id);
    if (idea) database.ref('ideas/' + id).update({ done: !idea.done });
};

window.deleteIdea = function(id) {
    if (!auth.currentUser) return;
    if(confirm("Silmek istediğine emin misin? 🐾")) database.ref('ideas/' + id).remove();
};

window.toggleDoneList = function() {
    document.getElementById('done-list').classList.toggle('open');
};
