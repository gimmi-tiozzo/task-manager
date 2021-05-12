const { MongoClient, ObjectID } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const database = "task-manager";

MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.error(error);
    }

    const db = client.db(database);
    //   db.collection("users").insertOne(
    //     {
    //       name: "Andrew",
    //       age: 27,
    //     },
    //     (error, result) => {
    //       if (error) return console.error(error);

    //       console.log(result.ops);
    //     }
    //   );

    //   db.collection("users").insertMany(
    //     [
    //       {
    //         name: "Gimmi Tiozzo",
    //         age: 41,
    //       },
    //       {
    //         name: "Stefano Boscolo",
    //         age: 40,
    //       },
    //     ],
    //     (error, result) => {
    //       if (error) return console.error(error);

    //       console.log(result.insertedCount);
    //       console.log(result.ops);
    //     }
    //   );

    db.collection("users").updateOne(
        {
            _id: new ObjectID("609c1c423eaa2d3790f19c11"),
        },
        {
            $set: {
                name: "Gimmi Tiozzo Netti",
            },
            $inc: {
                age: -2,
            },
        },
        (error, result) => {
            if (error) return console.error(error);

            console.log(result.modifiedCount);
        }
    );

    db.collection("users")
        .deleteOne({
            _id: new ObjectID("609c1c423eaa2d3790f19c11"),
        })
        .then((result) => console.log(result.deletedCount))
        .catch((error) => console.error(error));
});
