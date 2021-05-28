const serverless = require("serverless-http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");

// app.use(express.urlencoded());
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.unsubscribe(bodyParser.json());

app.post("/inspections", async (req, res) => {
  const data = req.body;
  const params = {
    TableName: "inspectionTrackTable",
    Item: {
      id: uuidv4(),
      unitNum: data.unitNum,
      building: data.building,
      managed: data.managed,
      rental: data.rental,
      inHouse: data.inHouse,
      robeCount: data.robeCount,
      inspected: data.inspected,
      notes: data.notes
    },
  };
  try {
    await db.put(params).promise();
    res.status(201).json({ unit: params.Item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/inspections", async (req, res) => {
  const params = {
    TableName: "inspectionTrackTable",
  };

  const result = await db.scan(params).promise();
  res.status(200).json({ units: result });
});

app.get("/inspections/:id", async (req, res) => {
  const data = req.apiGateway.event.body;
  const params = {
    TableName: "inspectionTrackTable",
    Key: {
      id: req.params.id,
    },
  };
     const result = await db.get(params).promise();
    res.status(200).json({ unitInfo: result });
})

app.patch("/inspections/:id", async (req, res) => {
  const data = req.apiGateway.event.body;
  const params = {
    TableName: "inspectionTrackTable",
    Item: {
      id: data.id,
      unitNum: data.unitNum,
      building: data.building,
      managed: data.managed,
      rental: data.rental,
      inHouse: data.inHouse,
      robCount: data.robeCount,
      inspected: data.inspected,
      notes: data.notes,
    },
  };
  await db.put(params).promise();
  res.status(200).json({ unitInfo: params.Item });
});

app.delete("/inspections/:id", async (req, res) => {
  const params = {
    TableName: "inspectionTrackTable",
    Key: {
      id: req.params.id
    },
  };

  await db.delete(params).promise();
  res.status(200).json({ success: true });
});
module.exports.app = serverless(app);
