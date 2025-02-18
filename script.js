document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        todoInput: document.getElementById('todoInput'),
        addButton: document.getElementById('addButton'),
        todoList: document.getElementById('todoList'),
        todoStats: document.getElementById('todoStats')
    };

    // Initial setup
    loadTodos();
    updateStats();

    // Event Listeners
    elements.addButton.addEventListener('click', addTodo);
    elements.todoInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addTodo();
    });

    // Functions
    function loadTodos() {
        const todos = getTodosFromStorage();
        renderTodos(todos);
    }

    function addTodo() {
        const todoText = elements.todoInput.value.trim();
        if (todoText) {
            const todos = getTodosFromStorage();
            const newTodo = {
                id: Date.now(),
                text: todoText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            todos.push(newTodo);
            saveTodos(todos);
            renderTodos(todos);
            elements.todoInput.value = '';
            updateStats();
        } else {
            elements.todoInput.classList.add('error');
            setTimeout(() => elements.todoInput.classList.remove('error'), 1500);
        }
    }

    function toggleTodo(id) {
        const todos = getTodosFromStorage();
        const updatedTodos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos(updatedTodos);
        renderTodos(updatedTodos);
        updateStats();
    }

    function deleteTodo(id) {
        const todos = getTodosFromStorage();
        const updatedTodos = todos.filter(todo => todo.id !== id);
        saveTodos(updatedTodos);
        renderTodos(updatedTodos);
        updateStats();
    }

    function renderTodos(todos) {
        elements.todoList.innerHTML = '';
        todos.sort((a, b) => {
            // Sort completed items to bottom
            if (a.completed === b.completed) {
                // If completion status is same, sort by creation date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.completed ? 1 : -1;
        }).forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.className = 'todo-checkbox';
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            const todoText = document.createElement('span');
            todoText.className = 'todo-text';
            todoText.textContent = todo.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = 'Delete todo';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            const date = document.createElement('span');
            date.className = 'todo-date';
            date.textContent = formatDate(todo.createdAt);

            li.appendChild(checkbox);
            li.appendChild(todoText);
            li.appendChild(date);
            li.appendChild(deleteBtn);
            elements.todoList.appendChild(li);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function updateStats() {
        const todos = getTodosFromStorage();
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        elements.todoStats.textContent = `${completed} of ${total} tasks completed`;
    }

    function getTodosFromStorage() {
        return JSON.parse(localStorage.getItem('todos')) || [];
    }

    function saveTodos(todos) {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Clear completed todos
    window.clearCompletedTasks = function() {
        const todos = getTodosFromStorage();
        const updatedTodos = todos.filter(todo => !todo.completed);
        saveTodos(updatedTodos);
        renderTodos(updatedTodos);
        updateStats();
    };
});
