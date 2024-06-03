const express = require('express');
const cors = require('cors');
const Person = require('./Person');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

let people = [];

// Endpoint to add a person
app.post('/person', (req, res) => {
  const { name, sex, dob } = req.body;
  const person = new Person(name, sex, dob);
  people.push(person);
  res.status(201).json(person.displayInfo());
});

// Endpoint to get all people
app.get('/people', (req, res) => {
  res.json(people.map(person => person.displayInfo()));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

