import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [dob, setDob] = useState('');
  const [people, setPeople] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [addError, setAddError] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [personName, setPersonName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [spouseError, setSpouseError] = useState('');
  const [spouseSuccess, setSpouseSuccess] = useState('');

  const fetchPeople = async () => {
    const response = await axios.get('http://localhost:5001/people');
    setPeople(response.data);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const addPerson = async (e) => {
    e.preventDefault();
    setAddError('');
    const newPerson = { name, sex, dob };
    try {
      await axios.post('http://localhost:5001/person', newPerson);
      fetchPeople();
      setName('');
      setSex('');
      setDob('');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setAddError('Person already exists');
      } else {
        setAddError('An error occurred');
      }
    }
  };

  const findPerson = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    try {
      const response = await axios.get(`http://localhost:5001/person?name=${searchName}`);
      setSearchResult(response.data);
      setSearchName('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSearchError('Person not found');
      } else {
        setSearchError('An error occurred');
      }
      setSearchName('');
    }
  };

  const setSpouse = async (e) => {
    e.preventDefault();
    setSpouseError('');
    setSpouseSuccess('');
    try {
      const response = await axios.post('http://localhost:5001/set-spouse', { personName, spouseName });
      setSpouseSuccess(response.data.message);
      setPersonName('');
      setSpouseName('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSpouseError('One or both persons not found');
      } else {
        setSpouseError('An error occurred');
      }
    }
  };

  const renderForm = () => {
    switch (selectedForm) {
      case 'addPerson':
        return (
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
            {addError && <p>{addError}</p>}
          </form>
        );
      case 'findPerson':
        return (
          <form onSubmit={findPerson}>
            <div>
              <label>Search by Name: </label>
              <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} />
            </div>
            <button type="submit">Find Person</button>
          </form>
        );
      case 'setSpouse':
        return (
          <form onSubmit={setSpouse}>
            <div>
              <label>Person Name: </label>
              <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} />
            </div>
            <div>
              <label>Spouse Name: </label>
              <input type="text" value={spouseName} onChange={e => setSpouseName(e.target.value)} />
            </div>
            <button type="submit">Set Spouse</button>
            {spouseError && <p>{spouseError}</p>}
            {spouseSuccess && <p>{spouseSuccess}</p>}
          </form>
        );
      default:
        return <p>Please select an option from the menu.</p>;
    }
  };

  const generateTreeData = () => {
    const findPersonNode = (name) => people.find(person => person.name === name);

    const buildNode = (person) => {
      if (!person) return null;

      return {
        name: person.name,
        attributes: {
          sex: person.sex,
          dob: person.dob,
          spouse: person.spouse ? person.spouse : 'None'
        },
        children: person.children.map(childName => buildNode(findPersonNode(childName))),
      };
    };

    const rootPerson = people.length > 0 ? people[0] : null;
    return rootPerson ? [buildNode(rootPerson)] : [];
  };

  return (
    <div className="App">
      <h1>Family Tree</h1>

      <nav>
        <select onChange={(e) => setSelectedForm(e.target.value)}>
          <option value="">Select an option</option>
          <option value="addPerson">Add Person</option>
          <option value="findPerson">Find Person</option>
          <option value="setSpouse">Set Spouse</option>
        </select>
      </nav>

      {renderForm()}

      {searchError && (
        <div>
          <h3>{searchError}</h3>
        </div>
      )}

      {searchResult && (
        <div>
          <h3>Search Result:</h3>
          <p>{searchResult.name}, {searchResult.sex}, {searchResult.dob}, Spouse: {searchResult.spouse}, Children: {searchResult.children.join(', ')}</p>
        </div>
      )}

      <h2>Family Members</h2>
      <ul>
        {people.map((person, index) => (
          <li key={index}>
            {person.name}, {person.sex}, {person.dob}, Spouse: {person.spouse}, Children: {person.children.join(', ')}
          </li>
        ))}
      </ul>

      <h2>Family Tree Visualization</h2>
      <div id="treeWrapper" style={{ width: '100%', height: '500px' }}>
        {people.length > 0 && <Tree data={generateTreeData()} />}
      </div>
    </div>
  );
}

export default App;


