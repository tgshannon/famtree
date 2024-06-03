import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [dob, setDob] = useState('');
  const [people, setPeople] = useState([]);

  const fetchPeople = async () => {
    const response = await axios.get('http://localhost:5001/people');
    setPeople(response.data);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const addPerson = async (e) => {
    e.preventDefault();
    const newPerson = { name, sex, dob };
    await axios.post('http://localhost:5001/person', newPerson);
    fetchPeople();
  };

  return (
    <div className="App">
      <h1>Person Management</h1>
      <form onSubmit={addPerson}>
        <div>
          <label>Name: </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Sex: </label>
          <input type="text" value={sex} onChange={e => setSex(e.target.value)} />
        </div>
        <div>
          <label>DOB: </label>
          <input type="text" value={dob} onChange={e => setDob(e.target.value)} />
        </div>
        <button type="submit">Add Person</button>
      </form>
      <h2>People List</h2>
      <ul>
        {people.map((person, index) => (
          <li key={index}>
            {person.name}, {person.sex}, {person.dob}, Spouse: {person.spouse}, Children: {person.children.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

