const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const { jwtToken, jwtToken2, task1, setupDatabase } = require("./fixtures/db");

//setup prima di ogni unit test
beforeEach(setupDatabase);

test("Crea un task associato all'utente autenticato", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
            description: "Task test",
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test("Ottieni i task per lo user one autenticato", async () => {
    const response = await request(app).get("/tasks").set("Authorization", `Bearer ${jwtToken}`).send().expect(200);

    expect(response.body).not.toBeNull();
    expect(response.body).toHaveLength(2);
});

test("Cancelazione non permessa per task non appartenenti allo user autenticato", async () => {
    await request(app).delete(`/tasks/${task1._id}`).set("Authorization", `Bearer ${jwtToken2}`).send().expect(404);

    const task = await Task.findById(task1._id);
    expect(task).not.toBeNull();
});
