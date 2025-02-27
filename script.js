document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        todos: [],
        filters: {
            status: 'all',
            category: 'all',
            priority: 'all',
            search: '',
            sortBy: 'dateCreated'
        },
        newTodo: {
            priority: 'normal',
            category: 'none',
            dueDate: ''
        },
        editingTodo: null,
        categories: [
            { id: 'none', name: 'None', icon: '', color: '' },
            { id: 'work', name: 'Work', icon: 'fas fa-briefcase', color: '#4A90E2' },
            { id: 'personal', name: 'Personal', icon: 'fas fa-user', color: '#9C27B0' },
            { id: 'shopping', name: 'Shopping', icon: 'fas fa-shopping-cart', color: '#FF9800' },
            { id: 'health', name: 'Health', icon: 'fas fa-heartbeat', color: '#4CAF50' }
        ],
        newCategory: {
            name: '',
            icon: 'fas fa-tag',
            color: '#4A90E2'
        },
        darkMode: false
    };

    // DOM Elements
    const elements = {
        // Main elements
        todoInput: document.getElementById('todoInput'),
        addButton: document.getElementById('addButton'),
        todoList: document.getElementById('todoList'),
        todoStats: document.getElementById('todoStats'),
        emptyState: document.getElementById('emptyState'),
        
        // Theme toggle
        themeToggle: document.getElementById('themeToggle'),
        
        // New todo options
        priorityDropdown: document.getElementById('priorityDropdown'),
        selectedPriority: document.getElementById('selectedPriority'),
        categoryDropdown: document.getElementById('categoryDropdown'),
        selectedCategory: document.getElementById('selectedCategory'),
        dueDatePicker: document.getElementById('dueDatePicker'),
        
        // Filters
        searchInput: document.getElementById('searchInput'),
        filterStatus: document.getElementById('filterStatus'),
        filterCategory: document.getElementById('filterCategory'),
        filterPriority: document.getElementById('filterPriority'),
        sortBy: document.getElementById('sortBy'),
        
        // Action buttons
        clearCompletedBtn: document.getElementById('clearCompletedBtn'),
        
        // Edit task modal
        editTaskModal: document.getElementById('editTaskModal'),
        editTaskText: document.getElementById('editTaskText'),
        editTaskPriority: document.getElementById('editTaskPriority'),
        editTaskCategory: document.getElementById('editTaskCategory'),
        editTaskDueDate: document.getElementById('editTaskDueDate'),
        editTaskNotes: document.getElementById('editTaskNotes'),
        saveTaskBtn: document.getElementById('saveTaskBtn'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),
        
        // Add category modal
        addCategoryModal: document.getElementById('addCategoryModal'),
        newCategoryName: document.getElementById('newCategoryName'),
        newCategoryColor: document.getElementById('newCategoryColor'),
        iconOptions: document.querySelectorAll('.icon-option'),
        saveCategoryBtn: document.getElementById('saveCategoryBtn'),
        cancelCategoryBtn: document.getElementById('cancelCategoryBtn')
    };

    // Initial setup
    initApp();

    // Event Listeners
    function setupEventListeners() {
        // Add todo
        elements.addButton.addEventListener('click', addTodo);
        elements.todoInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTodo();
        });
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleDarkMode);
        
        // Priority dropdown
        document.querySelectorAll('.priority-dropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                state.newTodo.priority = item.dataset.value;
                elements.selectedPriority.textContent = item.textContent.trim();
            });
        });
        
        // Category dropdown
        document.querySelectorAll('.category-dropdown .dropdown-item:not(.add-category)').forEach(item => {
            item.addEventListener('click', () => {
                state.newTodo.category = item.dataset.value;
                elements.selectedCategory.textContent = item.textContent.trim();
            });
        });
        
        // Add new category
        document.querySelector('.add-category').addEventListener('click', () => {
            openModal(elements.addCategoryModal);
        });
        
        // Due date picker
        elements.dueDatePicker.addEventListener('change', (e) => {
            state.newTodo.dueDate = e.target.value;
        });
        
        // Filters
        elements.searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value.toLowerCase();
            applyFilters();
        });
        
        elements.filterStatus.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            applyFilters();
        });
        
        elements.filterCategory.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            applyFilters();
        });
        
        elements.filterPriority.addEventListener('change', (e) => {
            state.filters.priority = e.target.value;
            applyFilters();
        });
        
        elements.sortBy.addEventListener('change', (e) => {
            state.filters.sortBy = e.target.value;
            applyFilters();
        });
        
        // Clear completed
        elements.clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        
        // Edit task modal
        elements.saveTaskBtn.addEventListener('click', saveEditedTask);
        elements.cancelEditBtn.addEventListener('click', () => closeModal(elements.editTaskModal));
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Add category modal
        elements.iconOptions.forEach(option => {
            option.addEventListener('click', () => {
                elements.iconOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                state.newCategory.icon = option.dataset.icon;
            });
        });
        
        elements.newCategoryColor.addEventListener('change', (e) => {
            state.newCategory.color = e.target.value;
        });
        
        elements.saveCategoryBtn.addEventListener('click', saveNewCategory);
        elements.cancelCategoryBtn.addEventListener('click', () => closeModal(elements.addCategoryModal));
    }

    // Functions
    function initApp() {
        loadTodos();
        loadCategories();
        loadDarkModePreference();
        setupEventListeners();
        updateCategoryDropdowns();
        applyFilters();
        updateStats();
    }
    
    function loadTodos() {
        state.todos = getTodosFromStorage();
    }
    
    function loadCategories() {
        const savedCategories = JSON.parse(localStorage.getItem('categories'));
        if (savedCategories) {
            state.categories = savedCategories;
        }
    }
    
    function loadDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        state.darkMode = darkMode;
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    function toggleDarkMode() {
        state.darkMode = !state.darkMode;
        if (state.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('darkMode', state.darkMode);
    }

    function addTodo() {
        const todoText = elements.todoInput.value.trim();
        if (todoText) {
            const newTodo = {
                id: Date.now(),
                text: todoText,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: state.newTodo.priority,
                category: state.newTodo.category,
                dueDate: state.newTodo.dueDate,
                notes: ''
            };
            
            state.todos.push(newTodo);
            saveTodos();
            
            // Reset input and options
            elements.todoInput.value = '';
            state.newTodo.priority = 'normal';
            state.newTodo.category = 'none';
            state.newTodo.dueDate = '';
            elements.selectedPriority.textContent = 'Normal';
            elements.selectedCategory.textContent = 'None';
            elements.dueDatePicker.value = '';
            
            applyFilters();
            updateStats();
        } else {
            elements.todoInput.classList.add('error');
            setTimeout(() => elements.todoInput.classList.remove('error'), 1500);
        }
    }

    function toggleTodo(id) {
        state.todos = state.todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        applyFilters();
        updateStats();
    }

    function deleteTodo(id) {
        state.todos = state.todos.filter(todo => todo.id !== id);
        saveTodos();
        applyFilters();
        updateStats();
    }
    
    function editTodo(id) {
        const todo = state.todos.find(todo => todo.id === id);
        if (todo) {
            state.editingTodo = todo;
            elements.editTaskText.value = todo.text;
            elements.editTaskPriority.value = todo.priority;
            elements.editTaskCategory.value = todo.category;
            elements.editTaskDueDate.value = todo.dueDate;
            elements.editTaskNotes.value = todo.notes || '';
            openModal(elements.editTaskModal);
        }
    }
    
    function saveEditedTask() {
        if (!state.editingTodo) return;
        
        const updatedTodo = {
            ...state.editingTodo,
            text: elements.editTaskText.value.trim(),
            priority: elements.editTaskPriority.value,
            category: elements.editTaskCategory.value,
            dueDate: elements.editTaskDueDate.value,
            notes: elements.editTaskNotes.value.trim()
        };
        
        state.todos = state.todos.map(todo => 
            todo.id === updatedTodo.id ? updatedTodo : todo
        );
        
        saveTodos();
        closeModal(elements.editTaskModal);
        applyFilters();
    }
    
    function saveNewCategory() {
        const categoryName = elements.newCategoryName.value.trim();
        if (!categoryName) return;
        
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        const newCategory = {
            id: categoryId,
            name: categoryName,
            icon: state.newCategory.icon,
            color: state.newCategory.color
        };
        
        state.categories.push(newCategory);
        saveCategories();
        updateCategoryDropdowns();
        
        // Reset and close modal
        elements.newCategoryName.value = '';
        elements.iconOptions.forEach(opt => opt.classList.remove('selected'));
        elements.newCategoryColor.value = '#4A90E2';
        state.newCategory = {
            name: '',
            icon: 'fas fa-tag',
            color: '#4A90E2'
        };
        
        closeModal(elements.addCategoryModal);
    }
    
    function updateCategoryDropdowns() {
        // Update category dropdowns in the main UI and modals
        const dropdowns = [
            document.querySelector('.category-dropdown'),
            elements.filterCategory,
            elements.editTaskCategory
        ];
        
        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // Keep the first options (like "All" for filter dropdown)
            const firstOptions = dropdown.tagName === 'SELECT' 
                ? Array.from(dropdown.options).filter(opt => opt.value === 'all')
                : [];
            
            // Clear dropdown
            if (dropdown.tagName === 'SELECT') {
                dropdown.innerHTML = '';
                firstOptions.forEach(opt => dropdown.appendChild(opt));
                
                // Add "None" option
                const noneOption = document.createElement('option');
                noneOption.value = 'none';
                noneOption.textContent = 'None';
                dropdown.appendChild(noneOption);
            } else {
                // For div dropdowns, keep the "Add New..." option
                const addNewOption = dropdown.querySelector('.add-category');
                dropdown.innerHTML = '';
                
                // Add "None" option
                const noneItem = document.createElement('div');
                noneItem.className = 'dropdown-item';
                noneItem.dataset.value = 'none';
                noneItem.textContent = 'None';
                noneItem.addEventListener('click', () => {
                    state.newTodo.category = 'none';
                    elements.selectedCategory.textContent = 'None';
                });
                dropdown.appendChild(noneItem);
                
                if (addNewOption) dropdown.appendChild(addNewOption);
            }
            
            // Add categories
            state.categories.filter(cat => cat.id !== 'none').forEach(category => {
                if (dropdown.tagName === 'SELECT') {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    dropdown.appendChild(option);
                } else {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.dataset.value = category.id;
                    
                    if (category.icon) {
                        const icon = document.createElement('i');
                        icon.className = category.icon;
                        if (category.color) {
                            icon.style.color = category.color;
                        }
                        item.appendChild(icon);
                    }
                    
                    const text = document.createTextNode(` ${category.name}`);
                    item.appendChild(text);
                    
                    item.addEventListener('click', () => {
                        state.newTodo.category = category.id;
                        elements.selectedCategory.textContent = category.name;
                    });
                    
                    dropdown.insertBefore(item, addNewOption);
                }
            });
        });
    }

    function applyFilters() {
        let filteredTodos = [...state.todos];
        
        // Apply status filter
        if (state.filters.status !== 'all') {
            filteredTodos = filteredTodos.filter(todo => 
                state.filters.status === 'completed' ? todo.completed : !todo.completed
            );
        }
        
        // Apply category filter
        if (state.filters.category !== 'all') {
            filteredTodos = filteredTodos.filter(todo => 
                todo.category === state.filters.category
            );
        }
        
        // Apply priority filter
        if (state.filters.priority !== 'all') {
            filteredTodos = filteredTodos.filter(todo => 
                todo.priority === state.filters.priority
            );
        }
        
        // Apply search filter
        if (state.filters.search) {
            filteredTodos = filteredTodos.filter(todo => 
                todo.text.toLowerCase().includes(state.filters.search)
            );
        }
        
        // Apply sorting
        filteredTodos.sort((a, b) => {
            // Always sort completed items to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then apply the selected sort
            switch (state.filters.sortBy) {
                case 'dateCreated':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'dueDate':
                    // Handle empty due dates (sort to bottom)
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { high: 0, normal: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                default:
                    return 0;
            }
        });
        
        renderTodos(filteredTodos);
    }

    function renderTodos(todos) {
        elements.todoList.innerHTML = '';
        
        if (todos.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }
        
        elements.emptyState.classList.add('hidden');
        
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
            
            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.className = 'todo-checkbox';
            checkbox.addEventListener('change', () => toggleTodo(todo.id));
            
            // Todo content
            const todoContent = document.createElement('div');
            todoContent.className = 'todo-content';
            
            const todoText = document.createElement('span');
            todoText.className = 'todo-text';
            todoText.textContent = todo.text;
            
            const todoMeta = document.createElement('div');
            todoMeta.className = 'todo-meta';
            
            // Category
            if (todo.category && todo.category !== 'none') {
                const category = state.categories.find(c => c.id === todo.category);
                if (category) {
                    const categorySpan = document.createElement('span');
                    categorySpan.className = 'todo-category';
                    
                    if (category.icon) {
                        const icon = document.createElement('i');
                        icon.className = category.icon;
                        if (category.color) {
                            icon.style.color = category.color;
                        }
                        categorySpan.appendChild(icon);
                    }
                    
                    const categoryText = document.createElement('span');
                    categoryText.textContent = category.name;
                    categorySpan.appendChild(categoryText);
                    
                    todoMeta.appendChild(categorySpan);
                }
            }
            
            // Due date
            if (todo.dueDate) {
                const dueDate = document.createElement('span');
                dueDate.className = 'todo-date';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-calendar-alt';
                dueDate.appendChild(icon);
                
                const dateText = document.createElement('span');
                
                // Check if due date is in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDateObj = new Date(todo.dueDate);
                dueDateObj.setHours(0, 0, 0, 0);
                
                if (dueDateObj < today && !todo.completed) {
                    dateText.style.color = 'var(--danger-color)';
                    icon.style.color = 'var(--danger-color)';
                }
                
                dateText.textContent = formatDate(todo.dueDate, 'date');
                dueDate.appendChild(dateText);
                
                todoMeta.appendChild(dueDate);
            }
            
            // Priority
            const prioritySpan = document.createElement('span');
            prioritySpan.className = 'todo-priority';
            
            const priorityIcon = document.createElement('i');
            priorityIcon.className = `fas fa-flag priority-${todo.priority}`;
            prioritySpan.appendChild(priorityIcon);
            
            const priorityText = document.createElement('span');
            priorityText.textContent = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
            prioritySpan.appendChild(priorityText);
            
            todoMeta.appendChild(prioritySpan);
            
            // Created date
            const createdDate = document.createElement('span');
            createdDate.className = 'todo-date';
            createdDate.innerHTML = `<i class="fas fa-clock"></i> ${formatDate(todo.createdAt, 'datetime')}`;
            todoMeta.appendChild(createdDate);
            
            todoContent.appendChild(todoText);
            todoContent.appendChild(todoMeta);
            
            // Action buttons
            const actionButtons = document.createElement('div');
            actionButtons.className = 'todo-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit task';
            editBtn.addEventListener('click', () => editTodo(todo.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            actionButtons.appendChild(editBtn);
            actionButtons.appendChild(deleteBtn);
            
            // Assemble todo item
            li.appendChild(checkbox);
            li.appendChild(todoContent);
            li.appendChild(actionButtons);
            
            elements.todoList.appendChild(li);
        });
    }

    function formatDate(dateString, type = 'datetime') {
        const date = new Date(dateString);
        
        if (type === 'date') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function updateStats() {
        const total = state.todos.length;
        const completed = state.todos.filter(todo => todo.completed).length;
        elements.todoStats.textContent = `${completed} of ${total} tasks completed`;
    }

    function getTodosFromStorage() {
        return JSON.parse(localStorage.getItem('todos')) || [];
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(state.todos));
    }
    
    function saveCategories() {
        localStorage.setItem('categories', JSON.stringify(state.categories));
    }

    function clearCompletedTasks() {
        state.todos = state.todos.filter(todo => !todo.completed);
        saveTodos();
        applyFilters();
        updateStats();
    }
    
    function openModal(modal) {
        modal.classList.add('active');
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
    }
});
