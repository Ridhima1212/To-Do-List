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
    repeat,
    notified: false
  };

  tasks.push(task);
  saveTasks();
  clearInputFields();
  renderTasks();
}

function renderTasks() {
  const categories = ['Work', 'Study', 'Personal', 'Other'];
  const now = new Date();

  categories.forEach(cat => {
    const section = document.getElementById(cat);
    const ul = section.querySelector('.task-list');
    ul.innerHTML = '';

    tasks.filter(task => task.category === cat).forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      let overdue = false;
      if (task.time && !task.completed) {
        const [hours, minutes] = task.time.split(':');

        const taskTime = new Date();
        taskTime.setHours(parseInt(hours));
        taskTime.setMinutes(parseInt(minutes));
        taskTime.setSeconds(0);
        taskTime.setMilliseconds(0);

        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);

        if (now > taskTime) {
          overdue = true;
        }
      }


      li.innerHTML = `
        <div class="task-header">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})" />
          <div class="task-info">
            <strong>${task.name}</strong>
            ${task.time ? `- <small>${task.time}</small>` : ''}
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            ${overdue ? '<span class="overdue">⚠ Overdue</span>' : ''}
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

function checkOverdueTasks() {
  const now = new Date();
  tasks.forEach(task => {
    if (!task.completed && task.time && !task.notified) {
      const taskTime = new Date();
      const [hours, minutes] = task.time.split(':');
      taskTime.setHours(parseInt(hours));
      taskTime.setMinutes(parseInt(minutes));
      taskTime.setSeconds(0);

      if (now > taskTime) {
        if (Notification.permission === 'granted') {
          new Notification('⏰ Task Overdue', {
            body: `"${task.name}" is overdue!`
          });
        }
        task.notified = true;
        saveTasks();
      }
    }
  });
}

// Ask notification permission on load
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setInterval(checkOverdueTasks, 60000); // Check every minute
});
// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setInterval(checkOverdueTasks, 60000); // Check every minute
});
function initializeApp() {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  renderTasks();
  setInterval(checkOverdueTasks, 60000); // Check every minute
}

// Handle normal load
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle iOS Safari page show from bfcache
window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    initializeApp();
  }
});
