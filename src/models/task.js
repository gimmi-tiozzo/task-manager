const mongoose = require("mongoose");

/**
 * Entità task
 */
const Task = mongoose.model("Task", {
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
});

module.exports = Task;