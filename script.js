const CATEGORIES = [
 { id: 'Food & Drinks', emoji: '🍜' },
 { id: 'Outdoor', emoji: '🌆' },
 { id: 'Cozy & Indoors', emoji: '🛋️' },
 { id: 'Creative', emoji: '🎨' },
 { id: 'Cultural', emoji: '🎭' },
 { id: 'Games & Fun', emoji: '🎮' },
 { id: 'Other', emoji: '😼' },
];

const DEFAULT_IDEAS = [
 { id: 1, name: 'Bilardo Date', category: 'Games & Fun', done: false },
 { id: 2, name: 'KFC', category: 'Food & Drinks', done: false },
 { id: 3, name: 'Study Date (2x a week)', category: 'Cozy & Indoors', done: false },
 { id: 4, name: '101 Learning Date', category: 'Cultural', done: false },
 { id: 5, name: 'Chess Date', category: 'Games & Fun', done: false },
 { id: 6, name: 'Zootopia at TEDU Date', category: 'Cultural', done: false },
 { id: 7, name: 'Lego date doing our Lego figures (Maybe in CEPA of ANKAMALL Idk) ', category: 'Creative', done: false },
 { id: 8, name: 'Shawarma Date', category: 'Food & Drinks', done: false },
 { id: 9, name: 'Coffee Date', category: 'Food & Drinks', done: false },
 { id: 10, name: 'Beer Date', category: 'Food & Drinks', done: false },
 { id: 11, name: 'Sushi Date', category: 'Food & Drinks', done: false },
 { id: 12, name: 'Sputnik Date', category: 'Outdoor', done: false },
 { id: 13, name: 'Clay Making Date', category: 'Creative', done: false },
 { id: 14, name: 'Antique Shop Date', category: 'Outdoor', done: false },
 { id: 15, name: 'Pasta Date(Makarna olan)', category: 'Food & Drinks', done: false },
 { id: 16, name: 'Theater Date', category: 'Cultural', done: false },
 { id: 17, name: 'Ulus-Kale Date', category: 'Outdoor', done: false },
 { id: 18, name: 'Müze Date', category: 'Cultural', done: false },
 { id: 19, name: 'Arcade Date', category: 'Games & Fun', done: false },
];

let ideas = [];
let activeFilter = 'All';
let recentPicks = [];

const DATA_VERSION = 'v2_cat_theme_v4'; // Versiyonu güncelleyerek tema değişikliklerini zorla

function loadIdeas() {
 const storedVersion = localStorage.getItem('dateIdeasVersion');
 const stored = localStorage.getItem('dateIdeas');
 if (stored && storedVersion === DATA_VERSION) {
  ideas = JSON.parse(stored);
 } else {
  ideas = DEFAULT_IDEAS.map(i => ({ ...i }));
  saveIdeas();
 }
}

function saveIdeas() {
 localStorage.setItem('dateIdeas', JSON.stringify(ideas));
 localStorage.setItem('dateIdeasVersion', DATA_VERSION);
}

function getCatEmoji(catId) {
 const cat = CATEGORIES.find(c => c.id === catId);
 return cat ? cat.emoji : '🐱';
}

function setFilter(cat) {
 activeFilter = cat;
 document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
 const btn = document.getElementById('filter-' + cat);
 if (btn) btn.classList.add('active');
}

function spinDate() {
 let pool = ideas.filter(i => activeFilter === 'All' || i.category === activeFilter);
 if (pool.length === 0) {
  showToast('No ideas in this category! 🐾');
  return;
 }

 // Avoid recently shown ideas (up to half the pool size, max 5)
 const avoidCount = Math.min(Math.floor(pool.length / 2), 5);
 let freshPool = pool.filter(i => !recentPicks.includes(i.id));
 if (freshPool.length === 0) {
  recentPicks = [];
  freshPool = pool;
 }

 // Fisher-Yates shuffle on freshPool
 for (let i = freshPool.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [freshPool[i], freshPool[j]] = [freshPool[j], freshPool[i]];
 }
 const pick = freshPool[0];

 // Track recent picks
 recentPicks.push(pick.id);
 if (recentPicks.length > avoidCount) recentPicks.shift();

 const card = document.getElementById('resultCard');
 card.classList.add('shaking');
 setTimeout(() => card.classList.remove('shaking'), 500);

 const doneTag = pick.done ? '<div style="color:var(--main-purple); font-weight:700; font-size:0.9rem; margin-top:8px;">✅ We\'ve done this one before!</div>' : '';
 card.innerHTML = `
  <div class="result-emoji">${getCatEmoji(pick.category)}</div>
  <div class="result-text">${pick.name}</div>
  <div class="result-cat">${pick.category}</div>
  ${doneTag}
 `;
}

function renderFilterButtons() {
 const row = document.getElementById('filterRow');
 row.innerHTML = `<button class="filter-btn active" onclick="setFilter('All')" id="filter-All">🐾 All</button>`;
 const usedCats = [...new Set(ideas.map(i => i.category))];
 usedCats.forEach(cat => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.id = 'filter-' + cat;
  btn.onclick = () => setFilter(cat);
  btn.textContent = getCatEmoji(cat) + ' ' + cat;
  row.appendChild(btn);
 });
 // restore active filter
 const active = document.getElementById('filter-' + activeFilter);
 if (active) active.classList.add('active');
 else { setFilter('All'); document.getElementById('filter-All').classList.add('active'); }
}

function renderIdeas() {
 const container = document.getElementById('ideasContainer');
 const doneList = document.getElementById('doneList');
 const notDone = ideas.filter(i => !i.done);
 const done = ideas.filter(i => i.done);

 // Group by category
 const groups = {};
 notDone.forEach(idea => {
  if (!groups[idea.category]) groups[idea.category] = [];
  groups[idea.category].push(idea);
 });

 container.innerHTML = '';
 if (notDone.length === 0) {
  container.innerHTML = '<div class="empty-msg">No ideas yet — add some below! 🐱</div>';
 } else {
  Object.entries(groups).forEach(([cat, catIdeas]) => {
   const group = document.createElement('div');
   group.className = 'category-group';
   group.innerHTML = `<div class="category-label">${getCatEmoji(cat)} ${cat}</div>`;
   catIdeas.forEach(idea => {
    group.appendChild(makeCard(idea, false));
   });
   container.appendChild(group);
  });
 }

 // Done list
 document.getElementById('doneCount').textContent = done.length;
 doneList.innerHTML = '';
 if (done.length === 0) {
  doneList.innerHTML = '<div class="empty-msg">No dates done yet — go on one! 🐾</div>';
 } else {
  done.forEach(idea => doneList.appendChild(makeCard(idea, true)));
 }

 renderFilterButtons();
}

function makeCard(idea, isDone) {
 const card = document.createElement('div');
 card.className = 'date-card' + (isDone ? ' done-card' : '');
 card.innerHTML = `
  <button class="tick-btn ${isDone ? 'ticked' : ''}" data-id="${idea.id}" title="${isDone ? 'Mark undone' : 'Mark done'}">✓</button>
  <span class="date-name">${idea.name}</span>
  <span class="date-cat-badge">${getCatEmoji(idea.category)}</span>
  <button class="remove-btn" data-id="${idea.id}" title="Remove">🗑️</button>
 `;
 card.querySelector('.tick-btn').addEventListener('click', () => toggleTick(idea.id));
 card.querySelector('.remove-btn').addEventListener('click', () => removeDate(idea.id));
 return card;
}

function toggleTick(id) {
 const idea = ideas.find(i => i.id === id);
 if (!idea) return;
 idea.done = !idea.done;
 saveIdeas();
 renderIdeas();
 showToast(idea.done ? '✅ Marked as done! 🐾' : '↩️ Moved back to list!');
}

function removeDate(id) {
 if (!confirm('Remove this date idea?')) return;
 ideas = ideas.filter(i => i.id !== id);
 saveIdeas();
 renderIdeas();
 showToast('🗑️ Idea removed!');
}

function addDate() {
 const nameInput = document.getElementById('newDateName');
 const catInput = document.getElementById('newDateCat');
 const name = nameInput.value.trim();
 const cat = catInput.value;
 if (!name) { showToast('Please enter a name! 🐱'); return; }
 const newId = ideas.length > 0 ? Math.max(...ideas.map(i => i.id)) + 1 : 1;
 ideas.push({ id: newId, name, category: cat, done: false });
 saveIdeas();
 renderIdeas();
 nameInput.value = '';
 showToast('🐾 New idea added!');
}

function toggleDone() {
 const dl = document.getElementById('doneList');
 dl.classList.toggle('open');
}

function populateCatSelect() {
 const sel = document.getElementById('newDateCat');
 sel.innerHTML = '';
 CATEGORIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.emoji + ' ' + c.id;
  sel.appendChild(opt);
 });
}

function showToast(msg) {
 const t = document.getElementById('toast');
 t.textContent = msg;
 t.classList.add('show');
 setTimeout(() => t.classList.remove('show'), 2500);
}

loadIdeas();
populateCatSelect();
renderIdeas();