const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
require("../db/mongoose");

const route = express.Router();

/**
 * Ricerca tutti i task
 */
route.get("/tasks", auth, async (_, res) => {
    try {
        const tasks = await Task.find({});
        tasks.forEach(async (t) => await t.populate("owner").execPopulate()); //TODO: capire perchè non si popola tasks

        if (tasks.length == 0) {
            return res.status("404").json({ message: "Tasks not found" });
        }

        res.json(tasks);
    } catch (e) {
        res.status(500).json();
    }
});

/**
 * Ricerca task per id
 */
route.get("/tasks/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findById(id);
        await task.populate("owner").execPopulate();

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${id}` });
        }

        return res.json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Inserisci un nuovo task
 */
route.post("/tasks", auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id,
        });

        await task.save();
        res.status(201).json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Aggiorna un Task
 */
route.patch("/tasks/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["description", "completed"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update Task by id" });
        }

        const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        await task.populate("owner").execPopulate();

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${id}` });
        }

        res.json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Elimina un task
 */
route.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${id}` });
        }

        res.json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = route;
