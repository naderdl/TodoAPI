const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected successfully to server");
  const db = client.db("TodoApp");

  // db.collection("Todos")
  //   .findOneAndUpdate(
  //     { _id: new ObjectID("5c82ba2a647c524c3e95eab8") },
  //     {
  //       $set: {
  //         completed: true
  //       }
  //     },
  //     {
  //       returnOriginal: false
  //     }
  //   )
  //   .then(result => {
  //     console.log(result);
  //   });

  db.collection("Users")
    .findOneAndUpdate(
      { _id: new ObjectID("5c824a22c8bf7c0ac29f6568") },
      {
        $set: {
          name: 'Nader'
        },
        $inc: {
          age: 1
        }
      },
      {
        returnOriginal: false
      }
    )
    .then(result => {
      console.log(result);
    });

  // client.close();
});
