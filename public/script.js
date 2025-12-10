const API_URL = 'http://localhost:3000/api/habits';
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', loadHabits);

function filterHabits(category) {
    currentFilter = category;
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    const btnId = category === 'all' ? 'btn-all' : `btn-${category}`;
    const activeBtn = document.getElementById(btnId);
    if(activeBtn) activeBtn.classList.add('active');
    loadHabits();
}

function updateCounters(habits) {
    const totalBtn = document.querySelector('#btn-all .counter');
    if(totalBtn) totalBtn.innerText = habits.length;
    const categories = ['Saúde', 'Estudos', 'Lazer', 'Trabalho', 'Outros'];
    categories.forEach(cat => {
        const count = habits.filter(h => h.category === cat).length;
        const btn = document.getElementById(`btn-${cat}`);
        if(btn) {
            btn.querySelector('.counter').innerText = count;
        }
    });
}

function updateRanking(habits) {
    const counts = {};
    habits.forEach(h => {
        const cat = h.category || 'Geral';
        counts[cat] = (counts[cat] || 0) + (h.streak || 0);
    });
    const sortedCategories = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    const list = document.getElementById('rankingList');
    if (sortedCategories.length === 0 || sortedCategories[0][1] === 0) {
        list.innerHTML = '<li class="ranking-empty">Comece sua jornada!</li>';
        return;
    }
    list.innerHTML = ''; 
    sortedCategories.forEach(([category, count]) => {
        const li = document.createElement('li');
        li.className = 'ranking-item';
        li.innerHTML = `
            <span>${category}</span>
            <span class="rank-count">${count}</span>
        `;
        list.appendChild(li);
    });
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        btn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
    }
}

async function loadHabits() {
    try {
        const response = await fetch(API_URL);
        const allHabits = await response.json();
        updateCounters(allHabits);
        updateRanking(allHabits);
        const list = document.getElementById('habitList');
        list.innerHTML = '';
        const filteredHabits = allHabits.filter(habit => {
            if (currentFilter === 'all') return true;
            return habit.category === currentFilter;
        });
        filteredHabits.forEach(habit => {
            const li = document.createElement('li');
            li.className = habit.completed ? 'completed' : '';
            li.innerHTML = `
                <div class="habit-info">
                    <span class="habit-name">${habit.name}</span>
                    <span class="habit-time">
                        <i class="far fa-clock"></i> ${habit.habit_time || '--:--'}
                    </span>
                    <div class="habit-meta">
                        <span class="habit-category">${habit.category || 'Geral'}</span>
                        <span class="habit-streak">
                            <i class="fas fa-cloud"></i> ${habit.streak} dias
                        </span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-check ${habit.completed ? 'done' : ''}" onclick="toggleHabit(${habit.id}, ${!habit.completed}, this)">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteHabit(${habit.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

async function addHabit() {
    const input = document.getElementById('habitInput');
    const timeInput = document.getElementById('timeInput');
    const categoryInput = document.getElementById('categoryInput'); 
    const name = input.value;
    const habit_time = timeInput.value;
    const category = categoryInput.value;
    if (!name) return alert('Digite um hábito!');
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, habit_time }) 
        });
        input.value = ''; 
        timeInput.value = ''; 
        loadHabits();  
    } catch (error) {
        alert("Erro ao criar hábito!");
    }   
}

async function toggleHabit(id, completed, buttonElement) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        if (!response.ok) throw new Error('Erro no servidor');
        if (completed && buttonElement) {
            const card = buttonElement.closest('li');
            if (card) {
                card.innerHTML = '<i class="fas fa-cloud cloud-poof-icon"></i>';
                card.classList.add('poof-disappear');
            }
            setTimeout(() => {
                loadHabits();
            }, 800);
        } else {
            loadHabits();
        }
    } catch (error) {
        console.error('Falha ao marcar hábito:', error);
        alert('Erro ao salvar! Verifique se o servidor está rodando.');
    }
}

async function deleteHabit(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadHabits();
    } catch (error) {
        alert("Erro ao deletar!");
    }
}