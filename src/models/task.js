const mongoose = require("mongoose");

/**
 * Schema per Task
 */
const schema = new mongoose.Schema(
    {
        /**
         * Descrizione del task
         */
        description: {
            type: String,
            required: true,
            trim: true,
        },
        /**
         * Indica se il task è completo o meno
         */
        completed: {
            type: Boolean,
            default: false,
        },
        /**
         * User proprietario dl task
         */
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Entità task
 */
const Task = mongoose.model("Task", schema);

module.exports = Task;
