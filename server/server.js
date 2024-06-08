const express = require('express');
const cors = require('cors');

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

app.post('/person', (req, res) => {
  const { name, sex, dob } = req.body;

  const existingPerson = people.find(person => person.name.toLowerCase() === name.toLowerCase());
  if (existingPerson) {
    return res.status(409).json({ error: 'Person already exists' });
  }

  const person = new Person(name, sex, dob);
  people.push(person);
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
  res.status(200).json({ message: 'Spouse set successfully', person: person.displayInfo() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


