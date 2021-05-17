const mongoose = require("mongoose");
const url = process.env.MONGO_URL ?? "127.0.0.1:27017";

//crea una connessione attiva verso mongodb
mongoose.connect(`mongodb://${url}/task-manager-api`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});
