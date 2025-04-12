// script.js
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
  const name = document.getElementById('taskName').value;
  const time = document.getElementById('taskTime').value;
  const priority = document.getElementById('taskPriority').value;
  const category = document.getElementById('taskCategory').value;
  const repeat = document.getElementById('taskRepeat').value;

  if (!name) {
    alert('Please enter a task name.');
    return;
  }

  const task = {
    id: Date.now(),
    name,
    time: time || null,
    completed: false,
    priority,
    category,
    repeat
  };

  tasks.push(task);
  saveTasks();
  clearInputFields();
  renderTasks();
}

function renderTasks() {
  const categories = ['Work', 'Study', 'Personal', 'Other'];
  categories.forEach(cat => {
    const section = document.getElementById(cat);
    const ul = section.querySelector('.task-list');
    ul.innerHTML = '';  // Clear existing tasks in that category

    tasks.filter(task => task.category === cat).forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const now = new Date();
      const overdue = task.time && new Date(`2025-04-12T${task.time}:00`) < now;

      li.innerHTML = `
        <div class="task-header">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})" />
          <div class="task-info">
            <strong>${task.name}</strong>
            ${task.time ? `- <small>${task.time}</small>` : ''}
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            ${overdue && !task.completed ? '<span class="overdue">⚠ Overdue</span>' : ''}
            <div>Repeat: ${task.repeat}</div>
            <div>Category: ${task.category}</div>
            <select class="edit-select" onchange="editTask(${task.id}, 'priority', this.value)">
              <option ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
              <option ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option ${task.priority === 'High' ? 'selected' : ''}>High</option>
            </select>
            <select class="edit-select" onchange="editTask(${task.id}, 'repeat', this.value)">
              <option ${task.repeat === 'None' ? 'selected' : ''}>None</option>
              <option ${task.repeat === 'Daily' ? 'selected' : ''}>Daily</option>
              <option ${task.repeat === 'Weekly' ? 'selected' : ''}>Weekly</option>
            </select>
            <select class="edit-select" onchange="editTask(${task.id}, 'category', this.value)">
              <option ${task.category === 'Work' ? 'selected' : ''}>Work</option>
              <option ${task.category === 'Study' ? 'selected' : ''}>Study</option>
              <option ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
              <option ${task.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="time" value="${task.time || ''}" onchange="editTask(${task.id}, 'time', this.value)" />
            <button class="delete-button" onclick="deleteTask(${task.id})">❌ Delete</button>
          </div>
        </div>
      `;
      ul.appendChild(li);
    });
  });

  updateProgress();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id, field, value) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task[field] = value;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;
  document.getElementById('progressBar').style.width = `${percent}%`;
}

function clearInputFields() {
  document.getElementById('taskName').value = '';
  document.getElementById('taskTime').value = '';
  document.getElementById('taskPriority').value = 'Low';
  document.getElementById('taskCategory').value = 'Work';
  document.getElementById('taskRepeat').value = 'None';
}

function showPendingTasks() {
  const pending = tasks.filter(t => !t.completed);
  if (pending.length === 0) {
    alert('No pending tasks!');
  } else {
    alert('You have ' + pending.length + ' pending task(s).');
  }
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', renderTasks);