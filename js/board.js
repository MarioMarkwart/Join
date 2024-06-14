let tasks = [];

let currentDraggedElement;

let categories = [
    {'category-0': "To do"},
    {'category-1': "In progress"}, 
    {'category-2': "Await Feedback"}, 
    {'category-3': "Done"}
];


/**
 * Initializes the board by including HTML, loading contacts and tasks from remote storage,
 * and rendering the categories.
 */
async function boardInit() {
    includeHTML();
    await getContactsFromRemoteStorage();
    getContactsOutOfUsers();
    await loadTasksFromRemoteStorage();
    renderCategories(tasks);
    // showAddTaskContainer();
    // openCard(2);
}


/**
 * Renders the cards inside each category based on the tasks provided.
 *
 * @param {Array} arrayToSearchIn - The array of tasks to search through.
 */
function renderCategories(arrayToSearchIn) {
    categories.forEach(category => {
        let categoryContainer = document.getElementById(Object.keys(category)[0]);
        categoryContainer.innerHTML = "";
        let filteredTasks = filterTasks(arrayToSearchIn, Object.keys(category)[0]);
        if (filteredTasks.length != 0) {
            for (let j = 0; j < filteredTasks.length; j++) {
                let task = getTaskOutOfId(filteredTasks[j].id);
                categoryContainer.innerHTML += renderTasksHTML(task);
                setCardType(task);
                renderAssignedToButtons(task);
            }
        } else {
            renderEmptyCategory(categoryContainer, Object.values(category)[0]);
        }});
    }


/**
 * Filters an array of tasks based on a specified category.
 *
 * @param {Array} arrayToSearchIn - The array of tasks to search through.
 * @param {string} category - The category to filter the tasks by.
 * @return {Array} An array of tasks that match the specified category.
 */
function filterTasks(arrayToSearchIn, category) {
    let filteredTasks = [];
    arrayToSearchIn.forEach((task) => {
        if (task['category'] == category) {
            filteredTasks.push(task);
        }
    });
    return filteredTasks;
}


/**
 * Renders the icons with the initials of the user's name on each card.
 *
 * @param {object} card - The card object containing information about the card
 */
function renderAssignedToButtons(task) {
    let assignedToContainer = document.getElementById('cardAssignedToContainerId' + task['id']);
    let assignedToContacts = task['assignedTo'];

    for (let i = 0; i < assignedToContacts.length; i++) {
        for (let j = 0; j < contacts.length; j++) {
            if (contacts[j]['id'] == assignedToContacts[i])
                assignedToContainer.innerHTML += renderAssignedToButtonsHTML(contacts[j]);
        }
    }
}


/**
 * 
 * @param {object} categoryContainer html-object from the (emtpy) category
 */
function renderEmptyCategory(categoryContainer, name) {
    categoryContainer.innerHTML = renderEmptyCategoryHTML(name);
}


/**
 * 
 * @param {string} taskPriority 
 * @returns html-image-tag
 */
function setPriorityImage(taskPriority) {
    if (taskPriority == 'low') return `<img src="assets/img/icon-priority_low.png">`
    else if (taskPriority == 'medium') return `<img src="assets/img/icon-priority_medium.png">`
    else return `<img src="assets/img/icon-priority_urgent.png">`
}


/**
 * Searches for tasks based on the value of the search input.
 *
 */
function searchTask() {
    let searchInput = document.getElementById('findTask');
    if(searchInput == null) return;
    let foundTasks = tasks.filter(task => task['title'].toLowerCase().includes(searchInput.value) || task['description'].toLowerCase().includes(searchInput.value));
    renderCategories(foundTasks);
}


/**
 * Renders a subtask progress bar and text based on the number of completed subtasks in a task.
 *
 * @param {object} task - The task object containing subtasks.
 * @return {string} The HTML code for the subtask progress bar and text.
 */
function renderSubtask(task) {
    let countSubtasks = +Object.keys(task['subtasks']).length;
    let completedSubtasks = task['subtasks'].filter(subtask => subtask['completed'] == true).length;
    let completedPercent = completedSubtasks * 100 / countSubtasks;

    if (countSubtasks != 0) {
        return /*html*/`<progress id="progressTodo" value="${completedPercent}" max="100"></progress><div class="cardSubtasksText">${completedSubtasks}/${countSubtasks} Subtasks</div>`
    }else{
        return ""
    }
}


/**
 * Returns the task object with the specified taskId from the tasks array.
 *
 * @param {number} taskId - The ID of the task to retrieve.
 * @return {Object|undefined} The task object with the specified taskId, or undefined if no task is found.
 */
function getTaskOutOfId(taskId){
    return tasks.filter(task => task['id'] == taskId)[0]
}


function setCardType(task){
    let cardType = document.getElementById(`cardType${task['id']}`);
    let openCardType = document.getElementById(`openCardType${task['id']}`)


    if (task.type == "User Story") {
        cardType.classList.add("cardTypeUserStory");
        if (openCardType) openCardType.classList.add("cardTypeUserStory");
    }else if (task.type == "Technical Task") {
        cardType.classList.add('cardTypeTechnicalTask')
        if (openCardType) openCardType.classList.add("cardTypeTechnicalTask");
    }
}


/**
 * Renders subtasks to the open card based on the task object.
 *
 * @param {object} task - The task object containing subtasks to render.
 */
function renderSubtasksToOpenCard(task){
    let container = document.getElementById('openCardSubtasksContainer');
    container.innerHTML = /*html*/`<span class="openCardText">Subtasks:</span><div id="openCardSubtasks"></div>`
    container.classList.add("openCardSubtasksContainer");
    let content = document.getElementById('openCardSubtasks');

    content.innerHTML = '';
    task['subtasks'].forEach((subtask, index) => {
        let completed = subtask['completed'] ? 'completed' : '';

        content.innerHTML += /*html*/`
        <div class="openCardSubtask" ${completed}>
            <div class="openCardSubtaskImgContainer" onclick="setSubtaskState(${task.id}, ${index})"></div>
            ${subtask['subtaskText']}
        </div>`
    })
}


/**
 * Toggles the completion state of a subtask in a task.
 * Also setting the attribute "completed" on the subtask element so the css can handle the image.
 *
 * @param {number} taskId - The ID of the task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask in the task's subtasks array.
 */
function setSubtaskState(taskId, subtaskIndex){
    let task = getTaskOutOfId(taskId);
    task['subtasks'][subtaskIndex]['completed'] = !task['subtasks'][subtaskIndex]['completed'];
    let openCardSubtasks = document.getElementsByClassName('openCardSubtask');

    for (let i = 0; i < openCardSubtasks.length; i++) {
        if(i == subtaskIndex) {
            openCardSubtasks[i].getAttribute('completed') == null
            ? openCardSubtasks[i].setAttribute('completed', '') 
            : openCardSubtasks[i].removeAttribute('completed')
        }
    }
}


/**
 * Deletes a task from the tasks array based on the provided taskId.
 *
 * @param {number} taskId - The ID of the task to be deleted.
 */
function openCardDelete(taskId){
    for(let i=0; i<tasks.length; i++){
        if(tasks[i].id == taskId){
            tasks.splice(i, 1);
            break;
        }
    }
    closeCard();
    renderCategories(tasks);
}


/**
 * Opens the edit card for the task with the specified ID.
 *
 * @param {number} taskId - The ID of the task to edit.
 */
function openCardEdit(taskId){
    newTask = getTaskOutOfId(taskId);
    renderEditContainer();
    renderContactsToDropdown();
    renderAssignedContactsContainer();
    renderSubtasks()
    setTaskValuesToFields(newTask);
}


/**
 * Renders the edit container by setting the 'editing' attribute, updating the HTML content of the 'openCardContainer' element, and appending the HTML code for the edit header, main content, and footer.
 */
function renderEditContainer(){
    let container = document.getElementById('openCardContainer');
    container.setAttribute('editing','');
    container.innerHTML = createEditHeader();
    container.innerHTML += renderAddTaskMainContentHTML();
    container.innerHTML += createEditFooter(newTask);
}


/**
 * Sets the values of the task fields in the edit card container.
 */
function setTaskValuesToFields(){
    tempAssignedContacts = [];
    document.getElementById('addTaskEnterTitleInput').value = newTask['title'];
    document.getElementById('addTaskDescriptionInput').value = newTask['description'];
    document.getElementById('addTaskDueDateInput').value = newTask['dueDate'];
    document.getElementById('dropdown-category-title').innerHTML = newTask['type'];
    setPriorityAppearance(newTask['priority']);
    renderEditCardAssignedContacts();
}


/**
 * Renders the assigned contacts in the edit card container.
 *
 * This function clears the contents of the 'assignedContactsContainer' element and then iterates over the 'assignedTo' array of the 'newTask' object. For each 'id' in the array, it calls the 'assignContactToTask' function to assign the corresponding contact to the task.
 */
function renderEditCardAssignedContacts(){
    document.getElementById('assignedContactsContainer').innerHTML = '';
    newTask['assignedTo'].forEach(id => {
        assignContactToTask(id);
    })
}


/**
 * Saves the edited task by collecting the necessary information, updating the task object,
 * saving the tasks to remote storage, closing the card, printing a confirmation message,
 * and printing the category values from each card.
 *
 * @param {number} taskId - The ID of the task to be saved.
 */
function saveEditedTask(taskId){
    collectInformationsForNewCard();
    let taskToSave = getTaskOutOfId(taskId);
    taskToSave = newTask;
    saveTasksToRemoteStorage();
    closeCard();
}


/**
 * Generates the HTML code for the header of the edit task section.
 *
 * @return {string} The HTML code for the edit task header.
 */
function createEditHeader(){
    return /*html*/`
<div class="boardEditTaskHeader">
    <div class="boardAddTaskCloseHoverContainer" onclick="closeCard()"></div>
 </div>
    `
}


/**
 * Generates the HTML code for the footer of the edit task section.
 *
 * @param {Object} task - The task object to be edited.
 * @return {string} The HTML code for the edit task footer.
 */
function createEditFooter(task){
    return /*html*/`
    <div class="addTaskBodyRight">
        <div class="createBtn addTaskBtn" onclick="saveEditedTask(${task.id}); doNotClose(event)">
            <span class="addTaskBtnText">Ok</span>
            <div class="createBtnImg"></div>
        </div>
    </div>`
}


/**
 * Creates empty cards and appends them to the specified categories.
 *
 * @param {string} taskId - The ID of the task element.
 * @param {Array<string>} categoryArr - An array of category IDs.
 */
function displayEmptyTask(taskId, categoryId){
    let cardHeight = "min-height: "+  document.getElementById(taskId).clientHeight + "px";
    // let cardHeight = "min-height: 100%";
    let cardWidth = "min-width: "+  document.getElementById(taskId).clientWidth + "px";
    let cardStyle = cardHeight + "; " + cardWidth;

    let newDiv = document.createElement('div');
    newDiv.classList.add('emptyCard');
    if(window.innerWidth < 1370){
        newDiv.classList.add('vertical')
    }

    newDiv.style = cardStyle;
    document.getElementById('category-' + categoryId).appendChild(newDiv);
}