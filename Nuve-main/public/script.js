const API_URL = 'https://nuve-1.onrender.com';

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', loadHabits);

// --- Funções de UI (filterHabits, updateCounters, updateRanking, toggleTheme) [SEM ALTERAÇÃO] ---

function filterHabits(category) {
// ... código sem alteração ...
}

function updateCounters(habits) {
// ... código sem alteração ...
}

function updateRanking(habits) {
// ... código sem alteração ...
}

function toggleTheme() {
// ... código sem alteração ...
}

// ------------------------------------------------------------------------------------------------

async function loadHabits() {
    try {
        // [AJUSTE AQUI]: Adiciona /api/habits
        const response = await fetch(`${API_URL}/api/habits`);
        const allHabits = await response.json();
        updateCounters(allHabits);
        updateRanking(allHabits);
        // ... restante do código sem alteração ...
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
        // [AJUSTE AQUI]: Adiciona /api/habits
        await fetch(`${API_URL}/api/habits`, {
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
        // [AJUSTE AQUI]: Adiciona /api/habits
        const response = await fetch(`${API_URL}/api/habits/${id}`, {
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
        
        await fetch(`${API_URL}/api/habits/${id}`, { method: 'DELETE' });
        loadHabits();
    } catch (error) {
        alert("Erro ao deletar!");
    }
}
