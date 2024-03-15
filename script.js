console.log("TEST");

//Variables
const todoInput = document.querySelector("#task-input");
const taskContainer = document.querySelector(".ctn-tasks");
const form = document.querySelector(".ctn-input");
let todos = [];
console.log(todos);

//Todos im Lokalen Speicher speichern und abrufen ✅

// Function to save todos to local storage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to load todos from local storage
function loadTodos() {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos !== null) {
    todos = JSON.parse(storedTodos);
    todos.forEach(function (todo) {
      renderTodo(todo);
    });
  }
}

//add todos to todolist
function addTodo(event) {
  event.preventDefault();

  const inputValue = todoInput.value.trim();

  if (inputValue !== "") {
    //creating object
    const newTodo = {
      description: inputValue,
      done: false,
      id: Math.floor(Math.random() * 99999999),
    };

    //Push & render
    todos.push(newTodo);
    console.log(todos);
    renderTodo(newTodo);
    //TEST
    console.log(todos);
    //Clear Value
    todoInput.value = "";

    //TEST
    console.log(newTodo);
  }
  saveTodos();
}
//Creating new todo ✅
function renderTodo(todo) {
  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item");
  //Create Checkbox and connect with Object status done: true/false
  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.id = "task-" + todo.id;
  //TEST
  console.log("log in renderTodo : ", todo.done);
  //ändert todo done value (fürs Backend) ggf toggleCheckbox ändern?
  checkBox.checked = todo.done;
  checkBox.todoObj = todo;

  //Create label, set ID and connect with Object description
  const taskText = document.createElement("label");
  taskText.textContent = todo.description;
  taskText.setAttribute("for", "task-" + todo.id);

  //Add checkbox and label to task-Item (html-div task-item)
  taskItem.appendChild(checkBox);
  taskItem.appendChild(taskText);
  //add to task-container (html-div ctn-task)
  taskContainer.appendChild(taskItem);
}

//Toggle Checkbox
function toggleCheckbox(event) {
  if (event.target.type === "checkbox") {
    const todo = event.target.todoObj;
    todo.done = event.target.checked;
    console.log("Updated todo:", todo);
  }
  saveTodos();
}
//Eventlistener submit input
form.addEventListener("submit", addTodo);

//Eventlistener Checkbox checked
taskContainer.addEventListener("change", toggleCheckbox);

// Duplikatprüfung

//Filtern von Todos ✅

const active = document.querySelector("#active");
const done = document.querySelector("#done");
const all = document.querySelector("#all");

function showTodos(filter) {
  const taskItems = document.querySelectorAll(".task-item");

  taskItems.forEach(function (item) {
    switch (filter) {
      case "all":
        item.style.display = "block";
        break;
      case "active":
        if (!item.querySelector('input[type="checkbox"]').checked) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
        break;
      case "done":
        if (item.querySelector('input[type="checkbox"]').checked) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
        break;
    }
  });
}

// Eventlistener for filteroption "Active"
active.addEventListener("click", function () {
  showTodos("active");
});

// Eventlistener for filteroption  "Done"
done.addEventListener("click", function () {
  showTodos("done");
});

// Eventlistener for filteroption  "All"
all.addEventListener("click", function () {
  showTodos("all");
});

//Erledigte ToDos entfernen ✅
const clear = document.querySelector(".btn-clear");

function removeDone(_event) {
  // Iteriere rückwärts durch das Array
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].done) {
      //Get the ID of the task which is supposed to be deleted
      const checkboxId = "task-" + todos[i].id;

      const taskItem = document.getElementById(checkboxId).parentNode;

      taskItem.remove();

      todos.splice(i, 1);
    }
  }
  saveTodos();
}
clear.addEventListener("click", removeDone);

// Initial load of todos from local storage
document.addEventListener("DOMContentLoaded", function () {
  loadTodos(); // Zuerst die Todos laden
  saveTodos(); // Dann die Todos speichern (falls welche geladen wurden)
});
////////////////////////////////////////
//API
//Daten Laden von API ✅

// Function which loads Data from Backend
function loadFromBackend() {
  //Request to Server
  fetch("http://localhost:4730/todos")
    //request successful? Yes - response pass to function (request params)
    .then((request) => request.json())
    //JSON parsing promise successful? Yes- parsed JSON data pass to function (as todos)
    .then((todosFromAPI) => {
      todos = todosFromAPI;
      todos.forEach(renderTodo);
      //TEST
      console.log("Zeigt API ITEMS an", todosFromAPI);
    });
}

loadFromBackend();

//Daten an die API senden

//Function which sends new Items to Backend
/*function sendToBackend(todo) {
  fetch("http://localhost:4730/todos", {
    //POST-Method
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
  .then */
