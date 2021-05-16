const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
require("../db/mongoose");

const route = express.Router();

/**
 * Ricerca il profilo dello user autenticato con token JWT
 */
route.get("/users/me", auth, async (req, res) => {
    await req.user.populate("tasks").execPopulate();
    res.json({ user: req.user, tasks: req.user.tasks });
});

/**
 * Ricerca tutti gli user
 */
route.get("/users", auth, async (_, res) => {
    try {
        const users = await User.find({});
        users.forEach(async (u) => await u.populate("tasks").execPopulate()); //TODO: capire perchè non si popola tasks

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
route.get("/users/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status("404").json({ message: `User not found by id ${id}` });
        }

        await user.populate("tasks").execPopulate();
        return res.json({ user, tasks: user.tasks });
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
        const token = await user.generateAuthToken();

        res.status(201).json({ user, token });
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Aggiorna User autenticato
 */
route.patch("/users/me", auth, async (req, res) => {
    try {
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["name", "email", "password", "age"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update User by id" });
        }

        requestProperties.forEach((prop) => (req.user[prop] = req.body[prop]));
        await req.user.save();

        await req.user.populate("tasks").execPopulate();
        res.json({ user: req.user, tasks: req.user.tasks });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

/**
 * Aggiorna uno User
 */
route.patch("/users/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["name", "email", "password", "age"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update User by id" });
        }

        //const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        //in questo modo scatta l'evento pre save per calcolare hash password
        const user = await User.findById(id);

        if (!user) {
            return res.status("404").json({ message: `User not found by id ${id}` });
        }

        requestProperties.forEach((prop) => (user[prop] = req.body[prop]));
        await user.save();

        await user.populate("tasks").execPopulate();
        res.json({ user, tasks: user.tasks });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

/**
 * Elimina lo user autenticato
 */
route.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.json(req.user);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Elimina uno User
 */
route.delete("/users/:id", auth, async (req, res) => {
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

/**
 * Esegui il login e restituisci il token JWT
 */
route.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.json({ user, token });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

/**
 * Esegui il loogout per un singolo accesso
 */
route.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token);
        await req.user.save();

        res.json(req.user);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Esegui il loogout per tutti gli accessi
 */
route.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.json(req.user);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = route;
