/* eslint-disable no-undef */
const request = require("supertest");
const db = require("../models/index");
const app = require("../app");

let server, agent;

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
    const res = await agent.post("/todos").send({
      title: "add new Task",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
    });

    expect(res.statusCode).toBe(200);
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");

    const parseData = JSON.parse(res.text);
    expect(parseData.id).toBeDefined();
  });

  test("mark todo as completd", async () => {
    const res = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
    });
    let parseData = JSON.parse(res.text);
    const id = parseData.id;

    expect(parseData.completed).toBe(false);

    const respose = await agent.put(`/todos/${id}/markascompleted`).send();
    parseData = JSON.parse(respose.text);

    expect(parseData.completed).toBe(true);
  });
});
