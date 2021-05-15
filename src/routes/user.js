const express = require("express");
const User = require("../models/user");
require("../db/mongoose");

const route = express.Router();

/**
 * Ricerca tutti gli user
 */
route.get("/users", async (_, res) => {
    try {
        const users = await User.find({});

        if (users.length == 0) {
            return res.status("404").json({ message: "Users not found" });
        }

        res.json(users);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Ricerca user per id
 */
route.get("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status("404").json({ message: `User not found by id ${id}` });
        }

        return res.json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Inserisci un nuovo user
 */
route.post("/users", async (req, res) => {
    try {
        const user = await new User(req.body).save();
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Aggiorna uno User
 */
route.patch("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["name", "email", "password", "age"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update User by id" });
        }

        const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!user) {
            return res.status("404").json({ message: `User not found by id ${id}` });
        }

        res.json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

route.delete("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status("404").json({ message: `User not found by id ${id}` });
        }

        res.json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = route;
