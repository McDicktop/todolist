let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

(function init100vh() {
    function setHeight() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setHeight();
    window.addEventListener('resize', setHeight);
})();

const main = document.querySelector('.main'),
    coverLayer = document.querySelector('.coverlayer'),
    backBtn = document.getElementById('backBtn'),
    removeListBtn = document.getElementById('removeListBtn'),
    removeTaskBtn = document.getElementById('removeTaskBtn'),
    addList = document.getElementById('addList'),
    addTask = document.getElementById('addTask'),
    newListForm = document.getElementById('newListForm'),
    editListForm = document.getElementById('editListForm'),
    newTaskForm = document.getElementById('newTaskForm'),
    editTaskForm = document.getElementById('editTaskForm'),

    newListConfirm = document.getElementById('newListConfirm'),
    newListCancel = document.getElementById('newListCancel'),
    editListConfirm = document.getElementById('editListConfirm'),
    editListCancel = document.getElementById('editListCancel'),
    newTaskConfirm = document.getElementById('newTaskConfirm'),
    newTaskCancel = document.getElementById('newTaskCancel'),
    editTaskConfirm = document.getElementById('editTaskConfirm'),
    editTaskCancel = document.getElementById('editTaskCancel'),

    newListInput = document.getElementById('newListInput'),
    editListInput = document.getElementById('editListInput'),
    newTaskInput = document.getElementById('newTaskInput'),
    editTaskInput = document.getElementById('editTaskInput'),

    newTextArea = document.getElementById('newTextArea'),
    editTextArea = document.getElementById('editTextArea'),

    undoneTasks = document.querySelector('.undoneTasks'),
    doneTasks = document.querySelector('.doneTasks'),

    title = document.getElementById('headerText'),

    editListRemove = document.getElementById('editListRemove'),
    editTaskRemove = document.getElementById('editTaskRemove');

let data = JSON.parse(localStorage.getItem('data')) ?? [],
    currentId,
    currentList,
    currentTaskId,
    currentTask;

class Todolist {
    constructor() {
        this.todolist = [];
    }
    restoreLists() {
        this.todolist = data;
    }
    addList(idArg, nameArg) {
        this.todolist.push({
            id: idArg,
            name: nameArg,
            tasks: [],
        });
        localStorage.setItem('data', JSON.stringify(this.todolist));
    }
    removeTasks(listId, taskIds) {
        let tasks = this.getListById(listId).tasks;
        taskIds.forEach(el => {
            let index = tasks.findIndex(item => item.taskId === el);
            tasks.splice(index, 1);
        });
        localStorage.setItem("data", JSON.stringify(this.todolist));
    }
    removeList(idArg) {
        let index = this.todolist.findIndex((el) => el.id === idArg);
        this.todolist.splice(index, 1);
        localStorage.setItem('data', JSON.stringify(this.todolist));
    }
    changeNameList(idArg, nameArg) {
        this.getListById(idArg).name = nameArg;
        localStorage.setItem('data', JSON.stringify(this.todolist));
    }
    addTaskToListById(idArg, taskArg) {
        this.getListById(idArg).tasks.push(taskArg);
        localStorage.setItem('data', JSON.stringify(this.todolist));
    }
    editTask(listId, taskId, nameArg, infoArg) {
        let task = this.getListById(listId).tasks.filter(el => el.taskId === taskId)[0];
        task.taskName = nameArg;
        task.taskComment = infoArg;
        localStorage.setItem('data', JSON.stringify(this.todolist));
    }
    getListById(idArg) {
        return this.todolist.filter((el) => el.id === idArg)[0];
    }
    getTaskInListById(listIdArg, taskIdArg) {
        return this.getListById(listIdArg).tasks.filter(el => el.taskId === taskIdArg)[0];
    }
    createTask(taskIdArg, taskNameArg, taskCommentArg) {
        return {
            taskId: taskIdArg,
            taskName: taskNameArg,
            taskComment: taskCommentArg,
            done: false,
        };
    }
}


/////////////////////////////////////////////////////

const todolist = new Todolist();

todolist.restoreLists();

hideForm(newListForm, editListForm, newTaskForm, editTaskForm);

addTask.style.display = 'none';
backBtn.style.display = 'none';
removeListBtn.style.display = 'none';
removeTaskBtn.style.display = 'none';
coverLayer.style.display = 'none';
title.innerHTML = 'Note lists';

displayLists();

////////////////////////////////////////////////////////

function hideForm(...formArg) {
    formArg.forEach(el => el.style.display = 'none');
}

function showForm(formArg) {
    formArg.style.display = 'block';
}

addList.addEventListener('click', () => {
    showForm(newListForm);
    newListInput.value = `New list ${data.length + 1}`;
    coverLayer.style.display = 'block';
})

addTask.addEventListener('click', () => {
    showForm(newTaskForm);
    newTextArea.value = '';
    newTaskInput.value = `New note ${todolist.getListById(currentId).tasks.length + 1}`
    coverLayer.style.display = 'block';
})

backBtn.addEventListener('click', () => {
    backBtn.style.display = 'none';
    addTask.style.display = 'none';
    addList.style.display = 'block';
    removeTaskBtn.style.display = 'none';

    Array.from(undoneTasks.querySelectorAll('.itemWrapper')).forEach(el => undoneTasks.removeChild(el));
    Array.from(doneTasks.querySelectorAll('.itemWrapper')).forEach(el => doneTasks.removeChild(el));

    displayLists();

    title.innerHTML = 'Note lists';
})

editListRemove.addEventListener('click', (event) => {
    todolist.removeList(currentId);
    refreshList();
    hideForm(editListForm);
    removeListBtn.style.display = 'none';
})
removeListBtn.addEventListener('click', (event) => {
    todolist.removeList(currentId);
    refreshList();
    hideForm(editListForm);
    removeListBtn.style.display = 'none';
})

removeTaskBtn.addEventListener('click', () => {
    let taskIds = [],
        done = document.querySelector('.doneTasks'),
        doneTasks = Array.from(done.querySelectorAll('.itemWrapper'));

    for (let item of doneTasks) taskIds.push(item.childNodes[0].id);

    todolist.removeTasks(currentId, taskIds);

    for (let item of doneTasks) done.removeChild(item);

    removeTaskBtn.style.display = 'none';
})

editTaskRemove.addEventListener('click', () => {
    todolist.removeTasks(currentId, [currentTaskId])
    currentTask.parentNode.parentNode.removeChild(currentTask.parentNode);
    hideForm(editTaskForm);
    coverLayer.style.display = 'none';
})

newListConfirm.addEventListener('click', () => {
    if (newListInput.value !== '') {
        let id = generateUUID();
        todolist.addList(id, newListInput.value);
        refreshList();
        hideForm(newListForm);
    }
})

newListCancel.addEventListener('click', () => {
    hideForm(newListForm);
    coverLayer.style.display = 'none';
    removeListBtn.style.display = 'none';
})

editListConfirm.addEventListener('click', (event) => {
    if (editListInput.value !== '') {
        todolist.changeNameList(currentId, editListInput.value);
        currentList.innerHTML = editListInput.value;
        hideForm(editListForm);
        removeListBtn.style.display = 'none';
        coverLayer.style.display = 'none';
    }
})

editListCancel.addEventListener('click', () => {
    hideForm(editListForm);
    removeListBtn.style.display = 'none';
    coverLayer.style.display = 'none';
})

newTaskConfirm.addEventListener('click', () => {
    if (newTaskInput.value !== '') {
        let id = generateUUID(),
            task = todolist.createTask(id, newTaskInput.value, newTextArea.value);
        todolist.addTaskToListById(currentId, task);
        refreshTasks();
    }
})

newTaskCancel.addEventListener('click', () => {
    hideForm(newTaskForm);
    coverLayer.style.display = 'none';
})

editTaskConfirm.addEventListener('click', () => {
    if (editTaskInput.value !== '') {
        todolist.editTask(currentId, currentTaskId, editTaskInput.value, editTextArea.value);
        currentTask.innerHTML = editTaskInput.value;
        hideForm(editTaskForm);
        coverLayer.style.display = 'none';
    }
})

editTaskCancel.addEventListener('click', () => {
    hideForm(editTaskForm);
    coverLayer.style.display = 'none';
})

function renderList(nameArg, idArg) {
    let item = document.createElement('div'),
        name = document.createElement('div'),
        edit = document.createElement('div');

    item.classList.add('itemWrapper');
    name.classList.add('name');
    edit.classList.add('editBtn');
    name.textContent = nameArg;
    name.id = idArg;

    main.appendChild(item);
    item.appendChild(name);
    item.appendChild(edit);
}

function renderTask(nameArg, idArg, isDone) {
    let item = document.createElement('div'),
        name = document.createElement('div'),
        checkbox = document.createElement('input');

    item.classList.add('itemWrapper');
    name.classList.add('name');

    checkbox.type = 'checkbox';
    checkbox.classList.add('checkbox');
    checkbox.id = idArg;

    name.textContent = nameArg;
    name.id = idArg;

    if (isDone === false) {
        undoneTasks.appendChild(item);
    } else {
        doneTasks.appendChild(item);
        checkbox.checked = true;
    }
    item.appendChild(name);
    item.appendChild(checkbox);
}

function displayTasks() {
    let tasksInList = todolist.getListById(currentId);
    tasksInList.tasks.forEach(el => renderTask(el.taskName, el.taskId, el.done));
}

function displayLists() {
    if (data) {
        for (let item of data) renderList(item.name, item.id);
        let newItems = Array.from(document.querySelectorAll('.name')),
            editItems = Array.from(document.querySelectorAll('.editBtn'));
        activateItems(newItems, editItems);
    }
}

function activateItems(newItemsArg, editItemsArg) {
    newItemsArg.forEach(el => {
        el.addEventListener('click', (event) => {
            currentId = event.target.id;

            addList.style.display = 'none';
            addTask.style.display = 'block';
            backBtn.style.display = 'block';
            title.innerHTML = el.innerHTML;

            let items = Array.from(document.querySelectorAll('.itemWrapper'));
            for (let item of items) main.removeChild(item);

            displayTasks();
            activateTasks();

            Array.from(document.getElementsByClassName('checkbox')).forEach(el => el.addEventListener('input', checkboxFn));

            if (Array.from(doneTasks.querySelectorAll('.itemWrapper')).length !== 0) removeTaskBtn.style.display = 'block';
        })
    })

    editItemsArg.forEach(el => {
        el.addEventListener('click', (event) => {
            currentId = event.target.previousSibling.id;
            currentList = event.target.previousSibling;
            showForm(editListForm);
            editListInput.value = currentList.innerHTML;
            removeListBtn.style.display = 'block';
            coverLayer.style.display = 'block';
        })
    })
}

function activateTasks() {
    Array.from(document.querySelectorAll('.name')).forEach(el => el.addEventListener('click', (event) => {
        currentTask = event.target;
        currentTaskId = event.target.id;
        showForm(editTaskForm);
        editTextArea.value = todolist.getTaskInListById(currentId, currentTaskId).taskComment;
        editTaskInput.value = currentTask.innerHTML;
        coverLayer.style.display = 'block';
    }));
}

function refreshList() {
    let items = Array.from(document.querySelectorAll('.itemWrapper'));
    for (let item of items) main.removeChild(item);
    displayLists();
    coverLayer.style.display = 'none';
}

function refreshTasks() {
    Array.from(undoneTasks.querySelectorAll('.itemWrapper')).forEach(el => undoneTasks.removeChild(el));
    Array.from(doneTasks.querySelectorAll('.itemWrapper')).forEach(el => doneTasks.removeChild(el));

    displayTasks();
    activateTasks();

    Array.from(document.getElementsByClassName('checkbox')).forEach(el => el.addEventListener('input', checkboxFn));

    hideForm(newTaskForm);
    coverLayer.style.display = 'none';
}

function checkboxFn(event) {
    let tasks = todolist.getListById(currentId).tasks;
    tasks.filter(el => el.taskId === event.target.id)[0].done = event.target.checked;

    localStorage.setItem('data', JSON.stringify(todolist.todolist));

    if (event.target.checked) {
        undoneTasks.removeChild(event.target.parentNode);
        doneTasks.appendChild(event.target.parentNode);
    } else {
        doneTasks.removeChild(event.target.parentNode);
        undoneTasks.appendChild(event.target.parentNode);
    }

    if (Array.from(doneTasks.querySelectorAll('.itemWrapper')).length === 0) {
        removeTaskBtn.style.display = 'none';
    } else {
        removeTaskBtn.style.display = 'block';
    };
}

function generateUUID() {
    let d = new Date().getTime();
    if (
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
    ) {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
}