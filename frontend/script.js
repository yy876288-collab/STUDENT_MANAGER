const API_URL = 'http://localhost:3000/tasks';
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const dueDateInput = document.getElementById('dueDate');
const tasksGrid = document.getElementById('tasks-grid');
const emptyState = document.getElementById('empty-state');
const progressBar = document.getElementById('progress-bar');
const taskCounter = document.getElementById('task-counter');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Theme Management
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
};

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
};

// API Calls
const fetchTasks = async () => {
    try {
        const response = await fetch(API_URL);
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks. Make sure backend is running.', error);

        // Example fallback so UI doesnt look entirely dead if backend isnt started by user
        if (tasks.length === 0) {
            renderTasks();
        }
    }
};

const addTask = async (e) => {
    e.preventDefault();

    const newTask = {
        title: titleInput.value,
        description: descriptionInput.value,
        dueDate: dueDateInput.value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            const createdTask = await response.json();
            tasks.push(createdTask);
            taskForm.reset();
            renderTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to connect to backend.');
    }
};

const toggleTaskStatus = async (id, currentStatus) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !currentStatus })
        });

        if (response.ok) {
            const updatedTask = await response.json();
            tasks = tasks.map(t => t.id === id ? updatedTask : t);
            renderTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

const deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// UI Rendering
const updateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    taskCounter.textContent = `${completedTasks}/${totalTasks} Completed`;

    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    progressBar.style.width = `${progressPercentage}%`;
};

const renderTasks = () => {
    updateStats();

    if (tasks.length === 0) {
        emptyState.classList.add('active');
        tasksGrid.innerHTML = '';
        return;
    }

    emptyState.classList.remove('active');

    tasksGrid.innerHTML = tasks.map(task => `
        <div class="task-card glass ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${task.title}</h3>
                </div>
                <span class="task-badge ${task.completed ? 'completed' : 'pending'}">
                    ${task.completed ? 'Done' : 'Pending'}
                </span>
            </div>
            
            ${task.description ? `<p class="task-desc">${task.description}</p>` : '<p class="task-desc"><em>No description provided</em></p>'}
            
            ${task.dueDate ? `
            <div class="task-meta">
                <span><i class="fa-regular fa-calendar"></i> Due: ${task.dueDate}</span>
            </div>` : ''}
            
            <div class="task-actions">
                <button class="btn-action btn-complete" onclick="toggleTaskStatus('${task.id}', ${task.completed})">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i> 
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteTask('${task.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
};

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
taskForm.addEventListener('submit', addTask);

// Initialization
initTheme();
fetchTasks();



