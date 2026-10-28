const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");  
const message = document.querySelector("#message");
const emptyState = document.querySelector("#emptyState");
const totalCount = document.querySelector("#totalCount");
const activeCount = document.querySelector("#activeCount");
const completedCount = document.querySelector("#completedCount");
const clearCompleted = document.querySelector("#clearCompleted");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = [];
try{
      const savedTasks = JSON.parse(localStorage.getItem("btech-tasks") || "[]");
      if(Array.isArray(savedTasks)){
            tasks = savedTasks.filter(task => 
                  task && 
                  typeof task.id === "string" &&
                  typeof task.text === "string" && 
                  typeof task.completed === "boolean"
            );
      }
} catch(error){
      tasks = [];
}
let currentFilter = "all";
function saveTasks(){
      try{
            localStorage.setItem("btech-tasks" ,JSON.stringify(tasks));
            return true;
      }catch(error){
            message.textContent = " unable to save tasks in this browser.";
            return false;
      }
}

function updateStats(){
      const completed  = tasks.filter(task => task.completed).length;
      const active = tasks.length - completed;

      totalCount.textContent = tasks.length;
      activeCount.textContent = active;
      completedCount.textContent = completed;
}

function renderTasks(){
      taskList.replaceChildren();

      const visibleTasks = tasks.filter(task => {
            if(currentFilter === "active"){
                  return !task.completed;
            }
            if(currentFilter === "completed"){
                  return task.completed;
            }
            return true;
      });
      visibleTasks.forEach(task => {
            const item = document.createElement("li");
            item.className = "task";

            if(task.completed){
                  item.classList.add("completed");
            }
            const chechbox = document.createElement("input");
            chechbox.type = "checkbox";
            chechbox.checked = task.completed;
            chechbox.setAttribute("aria-label", "Mark" + task.text + " as completed"
            );
            chechbox.addEventListener("change", function(){
                  task.completed = chechbox.checked;
                  saveTasks();
                  renderTasks();
            });
            const name = document.createElement("span");
            name.className = "task-name";
            name.textContent = task.text;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function() {
                  tasks = tasks.filter(item => item.id !== task.id);
                  saveTasks();
                  renderTasks();
            });

            item.append(chechbox, name, deleteButton);
            taskList.appendChild(item);
      });

      emptyState.hidden = visibleTasks.length !== 0;
      emptyState.textContent = tasks.length === 0 
      ? "No task yet. add your first task." :
       "Now tasks match this filter.";
       updateStats();
      
      }
      taskForm.addEventListener("submit", function(event){
            event.preventDefault();

            const text = taskInput.value.trim();

            if(text === ""){
                  message.textContent = "pleas inter a task filter.";
                  return;
            }
            const newTask = {
                  id: Date.now().toString() + "-" +
                  Math.random().toString(36).slice(2),
                  text: text,
                  completed: false
            };

            tasks.push(newTask);
            saveTasks();

            currentFilter = "all";
            taskInput.value ="";
            message.textContent = "";

            updateFilterButtons();
            renderTasks();
            taskInput.focus();
      });

      function updateFilterButtons(){
            filterButtons.forEach(button => {
                  const isActive = button.dataset.filter === currentFilter;
                  
                  button.classList.toggle("active", isActive);
                  button.setAttribute("aria-pressed", String(isActive));

            });

      }
      filterButtons.forEach(button => {
            button.addEventListener("click",
                  function(){
                        currentFilter = button.dataset.filter;
                        updateFilterButtons();
                        renderTasks();
                  });
      });

      clearCompleted.addEventListener("click" , function () {
            tasks = tasks.filter(task => ! task.completed);
            saveTasks();
            renderTasks();
      });

      renderTasks();
      updateFilterButtons();
