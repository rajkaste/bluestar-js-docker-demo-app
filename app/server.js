let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/images', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images", "profile-1.jpeg"));
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:admin@localhost:27017/admin";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:admin@mongodb:27017/admin";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

app.get('/get-profile', function (req, res) {

  console.log("STEP 1");

  MongoClient.connect(mongoUrlDocker, mongoClientOptions,function (err, client) {

    console.log("STEP 2");

    if (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }

    let db = client.db(databaseName);

    console.log("STEP 3");

    db.collection("users").findOne(
      { userid: 1 },
      function (err, result) {

        console.log("STEP 4");

        if (err) {
          console.log(err);
          return res.status(500).send(err.message);
        }

        console.log("STEP 5", result);

        client.close();

        res.send(result || {});
      }
    );
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
