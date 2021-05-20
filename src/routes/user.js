const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const email = require("../email/account");
require("../db/mongoose");

//router
const route = express.Router();

//middleware per la gestione dell'uploa di immagini
const upload = multer({
    //dest: "avatars",
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
            return cb(new Error(`${file.originalname} is invalid file. Only jpg/jpeg can be used!`));
        }

        cb(undefined, true);
    },
});

/**
 * Ottieni l'eventuale immagine dell'avatar per un utente autenticato
 */
route.get("/users/me/avatar", auth, (req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(404).send();
        }

        res.set("Content-Type", "image/jpg");
        res.send(req.user.avatar);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

/**
 * Ricerca il profilo dello user autenticato con token JWT
 */
route.get("/users/me", auth, async (req, res) => {
    try {
        await req.user.populate("tasks").execPopulate();
        res.json({ user: req.user, tasks: req.user.tasks });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
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
        res.status(500).json({ message: e.message });
    }
});

/**
 * Ottieni l'eventuale immagine dell'avatar per un utente
 */
route.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user?.avatar) {
            return res.status(404).send();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (e) {
        res.status(500).json({ message: e.message });
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
 * Route per l'upload di una immagine
 */
route.post(
    "/users/me/avatar",
    upload.single("avatar"),
    auth,
    async (req, res) => {
        try {
            req.user.avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
            await req.user.save();
            res.send();
        } catch (e) {
            res.status(500).json({ message: error.message });
        }
    },
    (error, req, res, next) => {
        res.status(400).json({ message: error.message });
    }
);

/**
 * Inserisci un nuovo user
 */
route.post("/users", async (req, res) => {
    try {
        const user = await new User(req.body).save();
        const token = await user.generateAuthToken();

        email.sendWelcomeMail(user.email, user.name).catch((e) => console.error(e));
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
 * Cancella l'avatar associato allo user
 */
route.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
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
        email.sendCancelationMail(req.user.email, req.user.name).catch((e) => console.error(e));
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
        res.status(500).json({ message: e.message });
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
