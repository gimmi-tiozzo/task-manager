const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { jwtToken, userId, userTestData, setupDatabase } = require("./fixtures/db");

//con after..ho i metodi di teardown (distruzione)

//setup prima di tutti gli unit test (test suite)
// beforeAll(async () => {
//     await User.deleteMany();
// });

//setup prima di ogni unit test
beforeEach(setupDatabase);

test("Creazione nuovo utente", async () => {
    const response = await request(app)
        .post("/users")
        .send({
            name: "Test User2",
            email: "test.user3@email.com",
            password: "123_pwd_321_2",
        })
        .expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        user: {
            name: "Test User2",
            email: "test.user3@email.com",
        },
        token: user.tokens[0].token,
    });

    expect(user.password).not.toBe("123_pwd_321_2");
});

test("login utente esistente", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: userTestData.email,
            password: userTestData.password,
        })
        .expect(200);

    const user = await User.findById(response.body.user._id);
    expect(response.body).toMatchObject({
        token: user.tokens[1].token,
    });
});

test("login utente non esistente", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: "__gimmi.tiozzo@gmail.com",
            password: userTestData.password,
        })
        .expect(400);
});

test("Recupera il profilo dell'utente autenticato", async () => {
    await request(app).get("/users/me").set("Authorization", `Bearer ${jwtToken}`).send().expect(200);
});

test("Recupera il profilo di utente non autenticato", async () => {
    await request(app).get("/users/me").send().expect(401);
});

test("Cancella un utente autenticato", async () => {
    await request(app).delete("/users/me").set("Authorization", `Bearer ${jwtToken}`).send().expect(200);
});

test("Cancella un utente non autenticato", async () => {
    await request(app).delete("/users/me").send().expect(401);
});

test("Carica una immagine come avatar", async () => {
    await request(app).post("/users/me/avatar").set("Authorization", `Bearer ${jwtToken}`).attach("avatar", "tests/fixtures/robot.jpg").expect(200);

    const user = await User.findById(userId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Aggiornamento user autenticato per proprietà esistente", async () => {
    const response = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
            name: "Jest Test",
        })
        .expect(200);

    const user = await User.findById(userId);
    expect(user.name).toBe(response.body.user.name);
});

test("Aggiornamento user autenticato per proprietà inesistente", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
            location: "USA",
        })
        .expect(400);
});
