const API_BASE = '/api/tasks';

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskList = document.getElementById('taskList');

// Load tasks on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task form submission
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    
    if (!title) return;
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description })
        });
        
        if (response.ok) {
            taskTitle.value = '';
            taskDescription.value = '';
            loadTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

// Load and display tasks
async function loadTasks() {
    try {
        const response = await fetch(API_BASE);
        const tasks = await response.json();
        
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Create task element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task ${task.completed ? 'completed' : ''}`;
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <button class="btn-small btn-complete" onclick="toggleTask(${task.id})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-small btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
    `;
    
    return taskDiv;
}

// Toggle task completion
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: true })
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

// Delete task
async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}
