const PRIORITY_LABELS = {
    'urgent-important': '重要紧急',
    'not-urgent-important': '重要不紧急',
    'urgent-not-important': '不重要紧急',
    'not-urgent-not-important': '不重要不紧急'
};
const PRIORITY_ORDER = ['urgent-important','not-urgent-important','urgent-not-important','not-urgent-not-important'];

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let groupMode = 'none';

tasks.forEach(t => { if (!t.createdAt) t.createdAt = t.id; });
save();

function save() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

function spawnConfetti(x, y) {
    const c = document.getElementById('confetti');
    const colors = ['#38bdf8','#818cf8','#c084fc','#22d3ee','#a78bfa'];
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.background = colors[i % colors.length];
        el.style.transform = `translate(${(Math.random()-0.5)*80}px, ${(Math.random()-0.5)*80}px)`;
        c.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const dueInput = document.getElementById('dueDate');
    const dueDate = dueInput.value || null;
    const now = Date.now();
    tasks.push({ id: now, text, done: false, createdAt: now, priority, dueDate });
    input.value = '';
    dueInput.value = '';
    save(); render();
}

function toggleTask(id, e) {
    const t = tasks.find(t => t.id === id);
    if (t) {
        t.done = !t.done;
        if (t.done) {
            const r = e.target.getBoundingClientRect();
            spawnConfetti(r.left + r.width / 2, r.top);
        }
    }
    save(); render();
}

function deleteTask(id, e) {
    const item = e.target.closest('.task-item');
    if (item) {
        item.classList.add('removing');
        setTimeout(() => { tasks = tasks.filter(t => t.id !== id); save(); render(); }, 280);
    }
}

function clearCompleted() {
    const doneTasks = tasks.filter(t => t.done);
    if (doneTasks.length === 0) return;
    tasks = tasks.filter(t => !t.done);
    save(); render();
}

function setFilter(f, btn) {
    filter = f;
    document.querySelectorAll('#filterBar button').forEach(b => {
        if (['全部','待完成','已完成'].includes(b.textContent)) b.classList.remove('active');
    });
    btn.classList.add('active');
    render();
}

function setGroup(g, btn) {
    groupMode = g;
    document.querySelectorAll('#filterBar button').forEach(b => {
        if (['不分组','按天','按周','按月'].includes(b.textContent)) b.classList.remove('active');
    });
    btn.classList.add('active');
    render();
}

function getWeekKey(ts) {
    const d = new Date(ts);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}年第${week}周`;
}

function getGroupKey(ts) {
    const d = new Date(ts);
    if (groupMode === 'day')
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (groupMode === 'week') return getWeekKey(ts);
    if (groupMode === 'month') return `${d.getFullYear()}年${d.getMonth()+1}月`;
    return null;
}

function formatGroupLabel(key) {
    if (groupMode === 'day') {
        const [y, m, d] = key.split('-');
        return `${y}年${parseInt(m)}月${parseInt(d)}日`;
    }
    return key;
}

function formatDueDate(dateStr) {
    if (!dateStr) return '';
    const due = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = Math.floor((dueDay - today) / 86400000);

    let label;
    if (diff === 0) label = '今天';
    else if (diff === 1) label = '明天';
    else if (diff === -1) label = '昨天';
    else if (diff > 1 && diff <= 7) label = `${diff}天后`;
    else if (diff < -1 && diff >= -7) label = `${Math.abs(diff)}天前`;
    else label = `${due.getMonth()+1}/${due.getDate()}`;

    const hh = String(due.getHours()).padStart(2, '0');
    const mm = String(due.getMinutes()).padStart(2, '0');

    return `<span class="task-due ${diff < 0 ? 'overdue' : ''}">${label} ${hh}:${mm}</span>`;
}

function renderTaskHTML(t) {
    const time = new Date(t.createdAt);
    const timeStr = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`;
    const p = t.priority || 'not-urgent-not-important';
    return `
        <li class="task-item ${p}">
            <div class="task-item-content">
                <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id}, event)">
                <span class="priority-dot ${p}"></span>
                <span class="task-text ${t.done ? 'done' : ''}">${t.text}</span>
                <button class="delete-btn" onclick="deleteTask(${t.id}, event)">&times;</button>
            </div>
            <div class="task-meta">
                ${formatDueDate(t.dueDate)}
                <span class="task-badge ${p}">${PRIORITY_LABELS[p]}</span>
                <span class="task-time">${timeStr}</span>
            </div>
        </li>`;
}

function render() {
    const container = document.getElementById('taskListContainer');

    let filtered = filter === 'all' ? [...tasks]
        : filter === 'done' ? tasks.filter(t => t.done)
        : tasks.filter(t => !t.done);

    filtered.sort((a, b) => {
        const pa = PRIORITY_ORDER.indexOf(a.priority || 'not-urgent-not-important');
        const pb = PRIORITY_ORDER.indexOf(b.priority || 'not-urgent-not-important');
        if (pa !== pb) return pa - pb;
        return b.createdAt - a.createdAt;
    });

    const doneCount = tasks.filter(t => t.done).length;
    const total = tasks.length;
    document.getElementById('doneCount').textContent = doneCount;
    document.getElementById('pendingCount').textContent = total - doneCount;
    const pct = total ? Math.round(doneCount / total * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';

    const footer = document.getElementById('cardFooter');
    if (total > 0) {
        footer.style.display = 'flex';
        document.getElementById('totalCount').textContent = total;
    } else {
        footer.style.display = 'none';
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty"><div class="icon">📝</div><p>${
            filter === 'done' ? '还没有完成的任务' : filter === 'pending' ? '所有任务都完成啦！' : '添加一个任务开始吧'
        }</p></div>`;
        return;
    }

    if (groupMode === 'none') {
        container.innerHTML = `<ul class="task-list">${filtered.map(renderTaskHTML).join('')}</ul>`;
        return;
    }

    const groups = {};
    filtered.forEach(t => {
        let key;
        if (t.dueDate) {
            const ts = new Date(t.dueDate).getTime();
            key = getGroupKey(ts);
        } else {
            key = '无截止日期';
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    let html = '';
    const now = Date.now();
    const todayKey = getGroupKey(now);
    const sorted = Object.entries(groups).sort((a, b) => {
        if (a[0] === todayKey) return -1;
        if (b[0] === todayKey) return 1;
        if (a[0] === '无截止日期') return 1;
        if (b[0] === '无截止日期') return -1;
        return a[0].localeCompare(b[0]);
    });
    for (const [key, items] of sorted) {
        html += `<div class="group-header">${formatGroupLabel(key)} <span class="count">${items.length}</span></div>`;
        html += `<ul class="task-list">${items.map(renderTaskHTML).join('')}</ul>`;
    }
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('taskInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTask();
    });

    // 优先级选中高亮（兼容 Qt WebEngine :has() 不生效）
    document.querySelectorAll('.priority-selector input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.priority-selector label').forEach(l => l.classList.remove('selected'));
            this.closest('label').classList.add('selected');
        });
    });
    // 初始化默认选中
    const checked = document.querySelector('.priority-selector input[type="radio"]:checked');
    if (checked) checked.closest('label').classList.add('selected');

    render();
});
