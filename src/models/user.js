const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const { jwtSalt } = require("../common/config");

const { Schema } = mongoose;

/**
 * Schema per entità User
 */
const schema = new Schema(
    {
        /**
         * Nome
         */
        name: {
            type: String,
            required: true,
            trim: true,
        },
        /**
         * Email
         */
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error(`Email ${value} is not valid`);
                }
            },
        },
        /**
         * Password
         */
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("password cannot include 'password' word");
                }
            },
        },
        /**
         * Età
         */
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("age must be greater than zero");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

/**
 * Proprieta virtuale di legame con i task
 */
schema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});

/**
 * Funzione middleware richiamata prima di eseguire il save. Salvo hash password
 */
schema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 8);
    }

    //continua con la successiva funzione middleware
    next();
});

/**
 * Funzione middleware richiamata prima di eseguire il remove. Elimino i task correlati
 */
schema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

/**
 * Creazione JSON eliminando i dati sensibili
 */
schema.methods.toJSON = function () {
    const user = this;
    const deepUserCopy = user.toObject();

    delete deepUserCopy.password;
    delete deepUserCopy.tokens;

    return deepUserCopy;
};

/**
 * Genera un token JWT
 */
schema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, jwtSalt);

    user.tokens.push({ token });
    await user.save();

    return token;
};

/**
 * Ricerca un utente in mongodb
 * @param {*} email email
 * @param {*} password password
 */
schema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};

/**
 * Entità User
 */
const User = mongoose.model("User", schema);

module.exports = User;
