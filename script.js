// 1. Firebase Yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyDRMXH9Scg88-FWDAC6eaaBKU5fjfwn7dw",
  authDomain: "date-ideas-app-ee6b5.firebaseapp.com",
  databaseURL: "https://date-ideas-app-ee6b5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "date-ideas-app-ee6b5",
  storageBucket: "date-ideas-app-ee6b5.firebasestorage.app",
  messagingSenderId: "623159578565",
  appId: "1:623159578565:web:1b2a70b0418e245cc405ac"
};

// 2. Başlatma ve Kategori Emojileri
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const ideasRef = database.ref('ideas');

const CATEGORY_EMOJIS = {
    'Cultural': '🎭',
    'Games & Fun': '🎮',
    'Food & Drinks': '🍕',
    'Outdoor': '🌳',
    'Cozy & Indoors': '🏠',
    'Creative': '🎨',
    'All': '📜',
    'General': '✨'
};

let ideas = [];
let currentFilter = 'All';

// Orijinal Liste (Firebase boşsa yüklenecek)
const DEFAULT_IDEAS = [
    { name: 'Bilardo Date', category: 'Games & Fun', done: false },
    { name: 'KFC', category: 'Food & Drinks', done: false },
    { name: 'Study Date (2x a week)', category: 'Cozy & Indoors', done: false },
    { name: '101 Learning Date', category: 'Cultural', done: false },
    { name: 'Chess Date', category: 'Games & Fun', done: false },
    { name: 'Zootopia at TEDU Date', category: 'Cultural', done: false },
    { name: 'Lego date doing our Lego figures', category: 'Creative', done: false },
    { name: 'Shawarma Date', category: 'Food & Drinks', done: false },
    { name: 'Coffee Date', category: 'Food & Drinks', done: false },
    { name: 'Beer Date', category: 'Food & Drinks', done: false },
    { name: 'Sushi Date', category: 'Food & Drinks', done: false },
    { name: 'Sputnik Date', category: 'Outdoor', done: false },
    { name: 'Clay Making Date', category: 'Creative', done: false },
    { name: 'Antique Shop Date', category: 'Outdoor', done: false },
    { name: 'Pasta Date(Makarna olan)', category: 'Food & Drinks', done: false },
    { name: 'Theater Date', category: 'Cultural', done: false },
    { name: 'Ulus-Kale Date', category: 'Outdoor', done: false },
    { name: 'Müze Date', category: 'Cultural', done: false },
    { name: 'Arcade Date', category: 'Games & Fun', done: false }
];

// 3. Verileri Yükle
function loadIdeas() {
    ideasRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            ideas = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
            DEFAULT_IDEAS.forEach(item => ideasRef.push(item));
        }
        renderIdeas();
    });
}

// 4. Filtreleme ve Dinamik Başlık Mantığı
function filterIdeas(category) {
    currentFilter = category;
    
    // Filtre butonlarının aktiflik durumunu güncelle
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Buton metinlerini kategorilerle eşleştiriyoruz (Örn: "Food" -> "Food & Drinks")
        const btnText = btn.innerText;
        const isMatch = (category === 'All' && btnText === 'All') ||
                        (category === 'Games & Fun' && btnText === 'Games') ||
                        (category === 'Food & Drinks' && btnText === 'Food') ||
                        (category === btnText);
        
        btn.classList.toggle('active', isMatch);
    });

    // BAŞLIĞI GÜNCELLE
    const titleEl = document.getElementById('list-title');
    if (titleEl) {
        const emoji = CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS['General'];
        const titleText = category === 'All' ? 'All Ideas' : `${category} Ideas`;
        titleEl.innerText = `${emoji} ${titleText}`;
    }
    
    renderIdeas();
}

// 5. Kart Oluşturma
function createCardElement(idea) {
    const template = document.getElementById('date-card-template');
    const clone = template.content.cloneNode(true);
    
    const card = clone.querySelector('.date-card');
    const nameEl = clone.querySelector('.date-name');
    const catEl = clone.querySelector('.result-cat');
    const emojiEl = clone.querySelector('.card-emoji');
    const tickBtn = clone.querySelector('.tick-btn');
    const delBtn = clone.querySelector('.delete-btn');

    nameEl.textContent = idea.name;
    emojiEl.textContent = CATEGORY_EMOJIS[idea.category] || CATEGORY_EMOJIS['General'];
    
    if (idea.done) {
        nameEl.style.textDecoration = "line-through";
        card.style.opacity = "0.7";
        tickBtn.classList.add('ticked');
        tickBtn.textContent = "✓";
        if (catEl) catEl.remove();
    } else {
        if (catEl) catEl.textContent = idea.category;
    }

    tickBtn.onclick = () => toggleDone(idea.id);
    delBtn.onclick = () => deleteIdea(idea.id);

    return clone;
}

// 6. Ekrana Çizdirme
function renderIdeas() {
    const listContainer = document.getElementById('ideas-list');
    const doneContainer = document.getElementById('done-list');
    const countLabel = document.getElementById('done-count');

    if (!listContainer || !doneContainer) return;

    listContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    const filtered = ideas.filter(i => currentFilter === 'All' || i.category === currentFilter);
    const pending = filtered.filter(i => !i.done);
    const done = ideas.filter(i => i.done);

    // Kategoriye göre gruplandırma
    const categories = {};
    pending.forEach(idea => {
        if (!categories[idea.category]) categories[idea.category] = [];
        categories[idea.category].push(idea);
    });

    for (const cat in categories) {
        const header = document.createElement('div');
        header.className = 'category-label';
        header.textContent = `${CATEGORY_EMOJIS[cat] || '✨'} ${cat}`;
        listContainer.appendChild(header);
        categories[cat].forEach(i => listContainer.appendChild(createCardElement(i)));
    }

    done.forEach(i => doneContainer.appendChild(createCardElement(i)));
    if (countLabel) countLabel.textContent = done.length;
}

// 7. Yardımcı Fonksiyonlar
function spinDate() {
    const activeIdeas = ideas.filter(i => !i.done);
    if (activeIdeas.length === 0) return alert("No ideas left! 🐾");
    const selected = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];
    const resultCard = document.querySelector('.result-card');
    
    resultCard.innerHTML = `
        <div class="result-text" style="font-family:'Baloo 2'; font-size:2rem; color:#4a3728;">${selected.name}</div>
        <span class="result-cat" style="background:#ffb7c5; padding:5px 15px; border-radius:20px; font-weight:800; color:#4a3728;">${selected.category}</span>
    `;
}

function addIdea() {
    const nameInput = document.getElementById('idea-name');
    const catSelect = document.getElementById('idea-category');
    if (!nameInput.value.trim()) return;
    
    ideasRef.push({ 
        name: nameInput.value, 
        category: catSelect.value, 
        done: false 
    });
    
    nameInput.value = "";
    if (typeof showToast === "function") showToast();
}

function toggleDone(id) {
    const idea = ideas.find(i => i.id === id);
    if (idea) database.ref('ideas/' + id).update({ done: !idea.done });
}

function deleteIdea(id) {
    if(confirm("Delete this idea? 🐾")) database.ref('ideas/' + id).remove();
}

function toggleDoneList() {
    const doneList = document.getElementById('done-list');
    if (doneList) doneList.classList.toggle('open');
}

window.onload = loadIdeas;