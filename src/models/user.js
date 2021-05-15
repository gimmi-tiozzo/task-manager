const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

/**
 * Schema per entità User
 */
const schema = new Schema({
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
     * Eta
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
});

/**
 * Entità User
 */
const User = mongoose.model("users", schema);

module.exports = User;
