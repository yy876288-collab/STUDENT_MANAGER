const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

// Helper function to read tasks
const readTasks = () => {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper function to write tasks
const writeTasks = (tasks) => {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), 'utf8');
};

// GET all tasks
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// POST a new task
app.post('/tasks', (req, res) => {
    const { title, description, dueDate } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = {
        id: Date.now().toString(),
        title,
        description: description || '',
        dueDate: dueDate || '',
        completed: false
    };

    const tasks = readTasks();
    tasks.push(newTask);
    writeTasks(tasks);

    res.status(201).json(newTask);
});

// PUT to update a task (complete/uncomplete)
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasks = readTasks();
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    // Toggle completion status or update specific fields if provided in body
    const updatedTask = { ...tasks[taskIndex], ...req.body };
    tasks[taskIndex] = updatedTask;
    writeTasks(tasks);

    res.json(updatedTask);
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    let tasks = readTasks();
    
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length === initialLength) {
        return res.status(404).json({ error: 'Task not found' });
    }

    writeTasks(tasks);
    res.json({ message: 'Task deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
