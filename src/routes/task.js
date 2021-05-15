const express = require("express");
const Task = require("../models/task");
require("../db/mongoose");

const route = express.Router();

/**
 * Ricerca tutti i task
 */
route.get("/tasks", async (_, res) => {
    try {
        const tasks = await Task.find({});

        if (tasks.length == 0) {
            return res.status("404").json({ message: "Tasks not found" });
        }

        res.json(tasks);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Ricerca task per id
 */
route.get("/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findById(id);

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
route.post("/tasks", async (req, res) => {
    try {
        const task = await new Task(req.body).save();
        res.status(201).json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

/**
 * Aggiorna un Task
 */
route.patch("/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["description", "completed"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update Task by id" });
        }

        const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${id}` });
        }

        res.json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

route.delete("/tasks/:id", async (req, res) => {
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
