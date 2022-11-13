/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function getCsrf(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Test cases for Todo manager", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("create todo", async () => {
    let res = await agent.get("/").send();
    let csrf = getCsrf(res);

    res = await agent.post("/todos").send({
      title: "add new Task",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
      _csrf: csrf,
    });

    expect(res.statusCode).toBe(302);
  });

  test("mark todo as completd", async () => {
    let res = await agent.get("/").send();
    let csrf = getCsrf(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
      _csrf: csrf,
    });

    res = await agent.get("/").set("Accept", "application/json");
    console.log(res.text);
    let parseData = JSON.parse(res.text);
    const dueTodayLength = parseData.dueToday.length;
    const newTodo = parseData.dueToday[dueTodayLength - 1];
    const status = newTodo.completed;

    res = await agent.get("/").send();
    csrf = getCsrf(res);

    res = await agent.put(`/todos/${newTodo.id}`).send({
      _csrf: csrf,
    });
    parseData = JSON.parse(res.text);
    upadteStatus = status ? false : true;
    expect(parseData.completed).toBe(upadteStatus);
  });

  test("should delete a Todo", async () => {
    let res = await agent.get("/").send();
    let csrf = getCsrf(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
      _csrf: csrf,
    });

    res = await agent.get("/").set("Accept", "application/json");
    console.log(res.text);
    let parseData = JSON.parse(res.text);
    const dueTodayLength = parseData.dueToday.length;
    const newTodo = parseData.dueToday[dueTodayLength - 1];

    res = await agent.get("/").send();
    csrf = getCsrf(res);

    res = await agent.delete(`/todos/${newTodo.id}`).send({
      _csrf: csrf,
    });

    const bool = Boolean(res.text);
    expect(bool).toBe(true);
  });
});
