console.log("TEST");

// Constants and variables for DOM elements and todo list
const todoInput = document.querySelector("#task-input");
const taskContainer = document.querySelector(".ctn-tasks");
const form = document.querySelector(".ctn-input");
let todos = []; // Array for saving todos

//URL for API
const urlAPI = "http://localhost:4730/todos/";

////////////////////////////////////////////////////

//Saving and loading todos from the local storage ✅

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
      // For each loaded todo, the render function is called to display it
      renderTodo(todo);
    });
  }
}

//funtion to add todos to todolist
function addTodo(event) {
  // Prevents the default behaviour of the form tag (reloading the page)
  event.preventDefault();
  // Input value without starting and final white space
  const inputValue = todoInput.value.trim();

  if (inputValue !== "") {
    // If the input is not empty => creating new object
    const newTodo = {
      description: inputValue,
      done: false,
      id: Math.floor(Math.random() * 99999999),
    };

    // The new task is added to the array and rendered
    todos.push(newTodo);
    console.log(todos);
    renderTodo(newTodo);
    //Clear Value
    todoInput.value = "";

    //TEST
    console.log(newTodo);
    // The new task is sent to the local storage and to the backend API
    saveTodos();
    sendToBackend(newTodo);
  }
}
////////////////////////////////////////////////////

//Creating new todo ✅
//Render a new task in the user interface
function renderTodo(todo) {
  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item");
  //Create Checkbox and connect with Object status done: true/false
  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.id = "task-" + todo.id;
  //TEST
  console.log("log in renderTodo : ", todo.done);
  //changes todo done value (for Backend Use)
  checkBox.checked = todo.done;
  checkBox.todoObj = todo;

  //Create label, set ID and connect with Object description
  const taskText = document.createElement("label");
  taskText.textContent = todo.description;
  taskText.setAttribute("for", "task-" + todo.id);

  //Add checkbox and label to task-Item (html-div = task-item)
  taskItem.appendChild(checkBox);
  taskItem.appendChild(taskText);
  //add to task-container (html-div = ctn-task)
  taskContainer.appendChild(taskItem);
}

// Function for switching the status of a task
async function toggleCheckbox(event) {
  if (event.target.type === "checkbox") {
    const todo = event.target.todoObj;
    todo.done = event.target.checked;
    console.log("Updated todo:", todo);
    try {
      // Changes are sent to the backend API
      await updateInBackend(todo);
    } catch (error) {
      //The local storage will be refreshed if errors appear
      console.error("Error updating todo in backend:", error);
      saveTodos();
      updateInBackend(todo); // Repeat attempt to send the changes to the API
    }
  }
}
//Eventlistener submit input
form.addEventListener("submit", addTodo);

//Eventlistener Checkbox checked
taskContainer.addEventListener("change", toggleCheckbox);

////////////////////////////////////////////////////

//Filterinng of todos ✅

//Variables - Filter options for todos
const active = document.querySelector("#active");
const done = document.querySelector("#done");
const all = document.querySelector("#all");

//// Function to display tasks based on the selected filter
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

////////////////////////////////////////////////////

//Delete todos with done:true

//function to remove completed Tasks in the API ⭕️
async function removeDone(event) {
  console.log("Removing done todos...");

  // Iterate backwards through the array
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].done) {
      console.log("Deleting done todo:", todos[i]);
      // Get the ID of the task which is supposed to be deleted
      const todoId = todos[i].id;

      // Remove the task from the DOM
      const checkboxId = "task-" + todoId;
      const taskItem = document.getElementById(checkboxId).parentNode;
      taskItem.remove();

      try {
        // Remove the task from the API
        const url = urlAPI + todoId;
        console.log("DELETE URL:", url);
        const response = await fetch(urlAPI + todoId, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete todo from backend.");
        }

        // Remove the task from the local todos array
        todos.splice(i, 1);
        console.log("Todo deleted from local array.");
        // Save the updated local todos list to the localStorage
        saveTodos();
        console.log("Local todos updated.");
      } catch (error) {
        console.error("Error deleting todo from backend:", error);

        continue; // Continue to next iteration even if an error comes up
      }
    }
  }
}
//// Event listener and const for removing completed tasks
document.addEventListener("DOMContentLoaded", function () {
  const clearButton = document.querySelector(".btn-clear");
  clearButton.addEventListener("click", removeDone);
});

////////////////////////////////////////////////////

// Save the updated local todos list to the localStorage
saveTodos();

// Initial load of todos from local storage
document.addEventListener("DOMContentLoaded", function () {
  loadTodos(); // First loading the todos
  saveTodos(); // Then save todos, if before loaded
});

//////////////////////////////////////////////////////////////////////////////////////////

//API

//Load Data from API ✅

// Function which loads Data from Backend
async function loadFromBackend() {
  //Request to Server
  fetch(urlAPI)
    //request successful? Yes - response pass to function (request params)
    .then((request) => request.json())
    //JSON parsing promise successful? Yes- parsed JSON data pass to function (as todos)
    .then((todosFromAPI) => {
      // Clear existing todos before loading from API
      todos = [];
      todosFromAPI.forEach(renderTodo);
      //TEST
      console.log("Zeigt API ITEMS an", todosFromAPI);
    });
}

loadFromBackend();

////////////////////////////////////////////////////

//Send Data to the API ✅

//Function which sends new Items to Backend
function sendToBackend(todo) {
  fetch(urlAPI, {
    //POST-Method
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add todo to backend.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Todo added successfully:", data);
    })
    .catch((error) => {
      console.error("Error adding todo to backend:", error);
    });
}

////////////////////////////////////////////////////

//Updating Data in the API ✅

async function updateInBackend(todo) {
  try {
    const response = await fetch(urlAPI + todo.id, {
      // HTTP method POST for adding new data
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo), // Converts the task into JSON format & sends it as a request body
    });
    // Check if the request was successful
    if (!response.ok) {
      // Error message if the request fails
      throw new Error("Failed to update todo in backend.");
    }

    console.log("Todo updated successfully:", todo);
  } catch (error) {
    // Error response to an error during the update process
    console.error("Error updating todo in backend:", error);
  }
}
