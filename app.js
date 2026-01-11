const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const tasksFile = path.join(__dirname, 'tasks.json');

// Initialize tasks file
async function initTasksFile() {
    try {
        await fs.access(tasksFile);
        console.log('✓ tasks.json exists');
    } catch {
        console.log('✗ Creating new tasks.json');
        await fs.writeFile(tasksFile, '[]');
    }
}

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('❌ GET /api/tasks:', error.message);
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const data = await fs.readFile(tasksFile, 'utf8');
        const tasks = JSON.parse(data);
        
        const newTask = {
            id: Date.now().toString(), // 👉 FIX: Store ID as STRING
            title,
            description: description || '',
            completed: false
        };
        
        tasks.push(newTask);
        await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask);
    } catch (error) {
        console.error('❌ POST /api/tasks:', error.message);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// PUT update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id; // 👉 FIX: Don't parseInt - use as string
        
        const data = await fs.readFile(tasksFile, 'utf8');
        const tasks = JSON.parse(data);
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('❌ PUT /api/tasks/:id:', error.message);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id; // 👉 FIX: Don't parseInt - use as string
        
        const data = await fs.readFile(tasksFile, 'utf8');
        const tasks = JSON.parse(data);
        
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        
        // Safety check
        if (filteredTasks.length === tasks.length) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        await fs.writeFile(tasksFile, JSON.stringify(filteredTasks, null, 2));
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('❌ DELETE /api/tasks/:id:', error.message);
        res.status(500).json({ 
            error: 'Failed to delete task',
            details: error.message 
        });
    }
});

// Initialize and start server
initTasksFile()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log('📁 Project path:', __dirname);
        });
    })
    .catch(console.error);
