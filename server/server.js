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
  const { name, sex, dob, children = [] } = req.body;

  // Check if person already exists
  const existingPerson = people.find(person => person.name.toLowerCase() === name.toLowerCase());
  if (existingPerson) {
    return res.status(409).json({ error: 'Person already exists' });
  }

  const person = new Person(name, sex, dob);

  children.forEach(({ name, sex, dob }) => {
    const child = new Person(name, sex, dob);
    person.addChild(child);
    people.push(child);
  })
  people.unshift(person);
  res.status(201).json(person.displayInfo());
});

// Endpoint to get all people
app.get('/people', (req, res) => {
  res.json(people.map(person => person.displayInfo()));
});

// Endpoint to find a person by name
app.get('/person', (req, res) => {
  const name = req.query.name;
  const person = people.find(person => person.name.toLowerCase() === name.toLowerCase());
  if (person) {
    res.json(person.displayInfo());
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Endpoint to set a spouse
app.post('/set-spouse', (req, res) => {
  const { personName, spouseName } = req.body;

  const person = people.find(p => p.name.toLowerCase() === personName.toLowerCase());
  const spouse = people.find(p => p.name.toLowerCase() === spouseName.toLowerCase());

  if (!person || !spouse) {
    return res.status(404).json({ error: 'One or both persons not found' });
  }

  person.setSpouse(spouse);
  res.status(200).json({ message: 'Spouse set successfully', person: person.displayInfo() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


