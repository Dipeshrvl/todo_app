const express = require("express");
const app = express();
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// csrf
app.use(cookieParser("using cookie Parser Packge for secrate string"));
// app.use(csurf("123456789iamasecret987654321look",["POST"],["PUT"],["DELETE"]));
app.use(csurf({ cookie: true }));

// set a view engine
app.set("view engine", "ejs");

// endpoints
app.get("/", async (req, res) => {
  // res.send("Hello From Express Js");
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();

  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
      overdue,
      dueToday,
      dueLater,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({ overdue, dueToday, dueLater });
    // res.json({allTodos})
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
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    res.redirect("/");
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
    // res.redirect("/");
  } catch (error) {
    res.status(422).send(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (req, res) => {
  console.log("Delete todos with Id : ", req.params.id);
  try {
    await Todo.remove(req.params.id);
    // res.redirect("/");
    res.json({ sucess: true });
  } catch (error) {
    res.status(422).send(error);
  }
});

module.exports = app;
