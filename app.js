const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// set a view engine
app.set("view engine", "ejs");

// endpoints
app.get("/", async (req, res) => {
  // res.send("Hello From Express Js");
  const allTodos = await Todo.getTodos();
  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
    });
  } else {
    res.json({ allTodos });
  }
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [["id", "ASC"]],
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(422).send(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("Req Body : ", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    res.status(200).json(todo);
  } catch (error) {
    res.status(422).send(error);
  }
});

app.put("/todos/:id/markascompleted", async (req, res) => {
  console.log("Mark a todos as completd Id : ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updateTodo = await todo.markAsCompletd();
    res.status(200).json(updateTodo);
  } catch (error) {
    res.status(422).send(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (req, res) => {
  console.log("Delete todos with Id : ", req.params.id);
  try {
    const rowCount = await Todo.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.send(rowCount ? true : false);
  } catch (error) {
    res.status(422).send(error);
  }
});

module.exports = app;
