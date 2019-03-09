const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected successfully to server");
  const db = client.db("TodoApp");

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat launch'}).then(result => {
  //   console.log(result);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then(result => {
  //   console.log(result);
  // })
  // findeOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then(result => {
  //   console.log(result);
  // })
  // Users
  // deleteMany
  // db.collection('Users').deleteMany({name: 'Nader Daliri'}).then(result => {
  //   console.log(result);
  // });
   // findeOneAndDelete
  db.collection('Users').findOneAndDelete({_id: new ObjectID('5c8283ffdc78840b53149e5c')}).then(result => {
    console.log(result);
  })


  // client.close();
});
