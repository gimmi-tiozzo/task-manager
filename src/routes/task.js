const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
require("../db/mongoose");

const route = express.Router();

/**
 * Ricerca tutti i task
 *
 * GET /tasks?completed=true
 * GET /tasks?limit=x&skip=y (x=record per pagina, y=record da scartare da inizio insieme)
 * GET /tasks?sortBy=createdAt:desc
 */
route.get("/tasks", auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }

        if (req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(":");
            sort[field] = order === "desc" ? -1 : 1;
        }

        //const tasks = await Task.find({});

        // const tasks = await Task.find({ owner: req.user._id });
        // tasks.forEach(async (t) => await t.populate("owner").execPopulate()); //TODO: capire perchè non si popola tasks

        // if (tasks.length == 0) {
        //     return res.status("404").json({ message: "Tasks not found" });
        // }

        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.json(req.user.tasks);
    } catch (e) {
        res.status(500).json();
    }
});

/**
 * Ricerca task per id
 */
route.get("/tasks/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id });
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
        const _id = req.params.id;
        const requestProperties = Object.keys(req.body);
        const allowProperties = ["description", "completed"];
        const isReqPropsValid = requestProperties.every((prop) => allowProperties.includes(prop));

        if (!isReqPropsValid) {
            return res.status(400).json({ message: "Invalid properties for Update Task by id" });
        }

        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${_id}` });
        }

        requestProperties.forEach((prop) => (task[prop] = req.body[prop]));
        await task.save();
        await task.populate("owner").execPopulate();

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
        const _id = req.params.id;
        //const task = await Task.findByIdAndDelete(_id);

        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

        if (!task) {
            return res.status("404").json({ message: `Task not found by id ${id}` });
        }

        res.json(task);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = route;
