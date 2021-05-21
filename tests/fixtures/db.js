const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

//dati di test:

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

const userId2 = new mongoose.Types.ObjectId();
const jwtToken2 = jwt.sign({ _id: userId2 }, process.env.JWT_SECRET);
const userTestData2 = {
    _id: userId2,
    name: "Test User 2_2",
    email: "test.user2_2@email.com",
    password: "123_pwd_321",
    tokens: [
        {
            token: jwtToken2,
        },
    ],
};

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task 1",
    completed: false,
    owner: userId,
};

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task 2",
    completed: true,
    owner: userId,
};

const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task 3",
    completed: true,
    owner: userId2,
};

//setup ad ogni test case
const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userTestData).save();
    await new User(userTestData2).save();
    await new Task(task1).save();
    await new Task(task2).save();
    await new Task(task3).save();
};

module.exports = {
    userId,
    jwtToken,
    userTestData,
    userId2,
    jwtToken2,
    userTestData2,
    task1,
    task2,
    task3,
    setupDatabase,
};
