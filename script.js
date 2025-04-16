// script.js
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filteredTasks = null; // Track if we're viewing filtered tasks

function addTask() {
  const name = document.getElementById('taskName').value;
  const time = document.getElementById('taskTime').value;
  const priority = document.getElementById('taskPriority').value;
  const category = document.getElementById('taskCategory').value;
  const repeat = document.getElementById('taskRepeat').value;
  const dueDate = document.getElementById('taskDate').value;

  if (!name) {
    alert('Please enter a task name.');
    return;
  }

  const task = {
    id: Date.now(),
    name,
    dueDate: dueDate || null,
    time: time || null,
    completed: false,
    priority,
    category,
    repeat,
    notified: false,
    order: tasks.length
  };

  tasks.push(task);
  saveTasks();
  clearInputFields();
  renderTasks();
  updateStatistics();
}

function renderTasks() {
  const categories = ['Work', 'Study', 'Personal', 'Other'];
  const tasksToRender = filteredTasks || tasks;
  
  categories.forEach(cat => {
    const section = document.getElementById(cat);
    const ul = section.querySelector('.task-list');
    ul.innerHTML = '';

    const categoryTasks = tasksToRender.filter(task => task.category === cat);
    
    // Show/hide category section based on if it has tasks
    section.style.display = categoryTasks.length > 0 ? 'block' : filteredTasks ? 'none' : 'block';

    categoryTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.setAttribute('draggable', 'true');
      li.dataset.taskId = task.id;
      
      // Check if task is overdue
      let overdue = false;
      if (task.dueDate && !task.completed) {
        const today = new Date().toISOString().split('T')[0];
        if (task.dueDate < today) {
          overdue = true;
        }
      }
      
      // Additional time check
      if (task.time && !task.completed && !overdue) {
        const [hours, minutes] = task.time.split(':');
        const taskTime = new Date();
        taskTime.setHours(parseInt(hours));
        taskTime.setMinutes(parseInt(minutes));
        taskTime.setSeconds(0);
        taskTime.setMilliseconds(0);

        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);

        if (now > taskTime && task.dueDate === new Date().toISOString().split('T')[0]) {
          overdue = true;
        }
      }

      li.innerHTML = `
        <div class="task-header">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})" />
          <div class="task-info">
            <strong>${task.name}</strong>
            ${task.dueDate ? `<div>Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
            ${task.time ? `<small>Time: ${task.time}</small>` : ''}
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            ${overdue ? '<span class="overdue">⚠ Overdue</span>' : ''}
            <div>Repeat: ${task.repeat}</div>
            <div>Category: ${task.category}</div>
            
            <div style="margin-top: 10px;">
              <label>Priority: </label>
              <select class="edit-select" onchange="editTask(${task.id}, 'priority', this.value)">
                <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
              </select>
              
              <label>Repeat: </label>
              <select class="edit-select" onchange="editTask(${task.id}, 'repeat', this.value)">
                <option value="None" ${task.repeat === 'None' ? 'selected' : ''}>None</option>
                <option value="Daily" ${task.repeat === 'Daily' ? 'selected' : ''}>Daily</option>
                <option value="Weekly" ${task.repeat === 'Weekly' ? 'selected' : ''}>Weekly</option>
              </select>
              
              <label>Category: </label>
              <select class="edit-select" onchange="editTask(${task.id}, 'category', this.value)">
                <option value="Work" ${task.category === 'Work' ? 'selected' : ''}>Work</option>
                <option value="Study" ${task.category === 'Study' ? 'selected' : ''}>Study</option>
                <option value="Personal" ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
                <option value="Other" ${task.category === 'Other' ? 'selected' : ''}>Other</option>
              </select>
              
              <label>Time: </label>
              <input type="time" value="${task.time || ''}" onchange="editTask(${task.id}, 'time', this.value)" />
              
              <button class="delete-button" onclick="deleteTask(${task.id})">❌ Delete</button>
            </div>
          </div>
        </div>
      `;
      ul.appendChild(li);
    });
  });

  updateProgress();
  enableDragAndDrop();
}

function renderFilteredTasks(filteredTaskList) {
  filteredTasks = filteredTaskList;
  renderTasks();
}

function resetView() {
  filteredTasks = null;
  renderTasks();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    
    // If task repeats and was completed, create a new instance
    if (task.completed && task.repeat !== 'None') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + (task.repeat === 'Daily' ? 1 : 7));
      
      const newTask = {
        ...task,
        id: Date.now(),
        completed: false,
        notified: false,
        dueDate: task.repeat === 'Daily' ? tomorrow.toISOString().split('T')[0] : 
                 task.repeat === 'Weekly' ? tomorrow.toISOString().split('T')[0] : 
                 task.dueDate
      };
      
      tasks.push(newTask);
    }
    
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

function editTask(id, field, value) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task[field] = value;
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStatistics();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateProgress() {
  const tasksToCount = filteredTasks || tasks;
  const total = tasksToCount.length;
  const done = tasksToCount.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;
  document.getElementById('progressBar').style.width = `${percent}%`;
}

function clearInputFields() {
  document.getElementById('taskName').value = '';
  document.getElementById('taskTime').value = '';
  document.getElementById('taskDate').value = '';
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

function filterTasks() {
  const filter = document.getElementById('filterOption').value;
  if (filter === 'all') {
    resetView();
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  let filtered = [...tasks];
  
  if (filter === 'today') {
    filtered = tasks.filter(task => task.dueDate === today);
  } else if (filter === 'tomorrow') {
    filtered = tasks.filter(task => task.dueDate === tomorrowStr);
  } else if (filter === 'overdue') {
    filtered = tasks.filter(task => !task.completed && task.dueDate && task.dueDate < today);
  } else if (filter === 'high-priority') {
    filtered = tasks.filter(task => task.priority === 'High');
  } else if (filter === 'incomplete') {
    filtered = tasks.filter(task => !task.completed);
  }
  
  renderFilteredTasks(filtered);
}

function sortTasks() {
  const sort = document.getElementById('sortOption').value;
  const tasksToSort = [...(filteredTasks || tasks)];
  
  if (sort === 'date-asc') {
    tasksToSort.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (sort === 'date-desc') {
    tasksToSort.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return b.dueDate.localeCompare(a.dueDate);
    });
  } else if (sort === 'priority-desc') {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    tasksToSort.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sort === 'priority-asc') {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    tasksToSort.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  } else if (sort === 'name') {
    tasksToSort.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  if (filteredTasks) {
    renderFilteredTasks(tasksToSort);
  } else {
    tasks = tasksToSort;
    saveTasks();
    renderTasks();
  }
}

function updateStatistics() {
  // Completion rate
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.querySelector('#completionRate .stat-value').textContent = `${completionRate}%`;
  
  // Tasks by category
  const categoryStats = document.querySelector('.category-stats');
  categoryStats.innerHTML = '';
  
  const categories = ['Work', 'Study', 'Personal', 'Other'];
  categories.forEach(cat => {
    const catTotal = tasks.filter(t => t.category === cat).length;
    const catCompleted = tasks.filter(t => t.category === cat && t.completed).length;
    
    if (catTotal > 0) {
      const div = document.createElement('div');
      div.className = 'category-stat';
      div.innerHTML = `
        <span>${cat}:</span>
        <span>${catCompleted}/${catTotal} (${Math.round((catCompleted/catTotal) * 100) || 0}%)</span>
      `;
      categoryStats.appendChild(div);
    }
  });
  
  // Weekly progress
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  
  const tasksThisWeek = tasks.filter(t => {
    if (!t.dueDate) return false;
    return t.dueDate >= oneWeekAgoStr;
  }).length;
  
  const completedThisWeek = tasks.filter(t => {
    if (!t.dueDate || !t.completed) return false;
    return t.dueDate >= oneWeekAgoStr;
  }).length;
  
  document.querySelector('#weeklyProgress .stat-value').textContent = 
    `${completedThisWeek}/${tasksThisWeek} tasks`;
}

function checkOverdueTasks() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  tasks.forEach(task => {
    if (task.completed || task.notified) return;
    
    // Check date
    if (task.dueDate && task.dueDate < today) {
      notifyUser(task, 'is overdue!');
      return;
    }
    
    // Check time on same day
    if (task.dueDate === today && task.time) {
      const [hours, minutes] = task.time.split(':');
      const taskTime = new Date();
      taskTime.setHours(parseInt(hours));
      taskTime.setMinutes(parseInt(minutes));
      
      if (now > taskTime) {
        notifyUser(task, 'time has passed!');
      }
    }
  });
}

function notifyUser(task, message) {
  if (Notification.permission === 'granted') {
    new Notification('⏰ Task Alert', {
      body: `"${task.name}" ${message}`
    });
  }
  
  task.notified = true;
  saveTasks();
}

// Enable drag and drop functionality
function enableDragAndDrop() {
  const taskLists = document.querySelectorAll('.task-list');
  
  taskLists.forEach(list => {
    // Clear existing event listeners
    const newList = list.cloneNode(true);
    list.parentNode.replaceChild(newList, list);
    
    newList.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('task-item')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
        e.target.classList.add('dragging');
      }
    });
    
    newList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(newList, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (draggable && newList.id === draggable.parentElement.id) {
        if (afterElement) {
          newList.insertBefore(draggable, afterElement);
        } else {
          newList.appendChild(draggable);
        }
      }
    });
    
    newList.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('task-item')) {
        e.target.classList.remove('dragging');
        updateTaskOrder();
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateTaskOrder() {
  const taskElements = document.querySelectorAll('.task-item');
  taskElements.forEach((el, index) => {
    const taskId = parseInt(el.dataset.taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.order = index;
    }
  });
  
  saveTasks();
}

// Dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  
  // Check for saved theme preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Theme toggle functionality
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
  
  // Initialize the app
  renderTasks();
  updateStatistics();
  setInterval(checkOverdueTasks, 60000); // Check every minute
  
  // Request notification permission
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});
