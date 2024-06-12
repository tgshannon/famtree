const express = require('express');
const cors = require('cors');
const fs = require('fs');

class Person {
  constructor(name, sex, dob) {
    this.name = name;
    this.sex = sex;
    this.dob = dob;
    this.spouse = null;
    this.children = [];
  }

  setSpouse(spouse) {
    if (spouse instanceof Person) {
      this.spouse = spouse;
      spouse.spouse = this;
    } else {
      throw new Error("Spouse must be a Person object");
    }
  }

  addChild(child) {
    if (child instanceof Person) {
      this.children.push(child);
    } else {
      throw new Error("Child must be a Person object");
    }
  }

  displayInfo() {
    return {
      name: this.name,
      sex: this.sex,
      dob: this.dob,
      spouse: this.spouse ? this.spouse.name : 'None',
      children: this.children.map(child => child.name)
    };
  }

  static findPerson(array, name) {
    return array.find(person => person.name.toLowerCase() === name.toLowerCase());
  }
}

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

let people = [];

// File path for storing data
const DATA_FILE = 'people.json';

// Function to load data from file
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    people = parsedData.map(p => {
      const person = new Person(p.name, p.sex, p.dob);
      person.spouse = p.spouse ? new Person(p.spouse.name, p.spouse.sex, p.spouse.dob) : null;
      person.children = p.children.map(child => new Person(child.name, child.sex, child.dob));
      return person;
    });
  }
};

// Function to save data to file
const saveData = () => {
  const data = JSON.stringify(people.map(person => ({
    name: person.name,
    sex: person.sex,
    dob: person.dob,
    spouse: person.spouse ? { name: person.spouse.name, sex: person.spouse.sex, dob: person.spouse.dob } : null,
    children: person.children.map(child => ({ name: child.name, sex: child.sex, dob: child.dob }))
  })), null, 2);
  fs.writeFileSync(DATA_FILE, data);
};

app.post('/person', (req, res) => {
  const { name, sex, dob } = req.body;

  const existingPerson = people.find(person => person.name.toLowerCase() === name.toLowerCase());
  if (existingPerson) {
    return res.status(409).json({ error: 'Person already exists' });
  }

  const person = new Person(name, sex, dob);
  people.push(person);
  saveData();
  res.status(201).json(person.displayInfo());
});

app.get('/people', (req, res) => {
  res.json(people.map(person => person.displayInfo()));
});

app.get('/person', (req, res) => {
  const name = req.query.name;
  const person = people.find(person => person.name.toLowerCase() === name.toLowerCase());
  if (person) {
    res.json(person.displayInfo());
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

app.post('/set-spouse', (req, res) => {
  const { personName, spouseName } = req.body;

  const person = people.find(p => p.name.toLowerCase() === personName.toLowerCase());
  const spouse = people.find(p => p.name.toLowerCase() === spouseName.toLowerCase());

  if (!person || !spouse) {
    return res.status(404).json({ error: 'One or both persons not found' });
  }

  person.setSpouse(spouse);
  saveData();
  res.status(200).json({ message: 'Spouse set successfully', person: person.displayInfo() });
});

app.post('/add-child', (req, res) => {
  const { parentName, childName } = req.body;

  const parent = people.find(p => p.name.toLowerCase() === parentName.toLowerCase());
  const child = people.find(p => p.name.toLowerCase() === childName.toLowerCase());

  if (!parent || !child) {
    return res.status(404).json({ error: 'Parent or child not found' });
  }

  try {
    parent.addChild(child);
    saveData();
    res.status(200).json({ message: 'Child added successfully', parent: parent.displayInfo() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Load data when the server starts
loadData();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


