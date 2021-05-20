const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userId = new mongoose.Types.ObjectId();
const jwtToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET);

const userTestData = {
    _id: userId,
    name: "Test User",
    email: "test.user@email.com",
    password: "123_pwd_321",
    tokens: [
        {
            token: jwtToken,
        },
    ],
};

//con after..ho i metodi di teardown (distruzione)

//setup prima di tutti gli unit test (test suite)
// beforeAll(async () => {
//     await User.deleteMany();
// });

//setup prima di ogni unit test
beforeEach(async () => {
    await User.deleteMany();
    const user = new User(userTestData);
    await user.save();
});

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
