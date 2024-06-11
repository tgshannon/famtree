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
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childError, setChildError] = useState('');
  const [childSuccess, setChildSuccess] = useState('');
  const [rootPersonName, setRootPersonName] = useState('');

  const fetchPeople = async () => {
    try {
      const response = await axios.get('http://localhost:5001/people');
      setPeople(response.data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
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
      setRootPersonName(response.data.name);
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
      fetchPeople(); // Fetch people again to update the tree
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSpouseError('One or both persons not found');
      } else {
        setSpouseError('An error occurred');
      }
    }
  };

  const addChild = async (e) => {
    e.preventDefault();
    setChildError('');
    setChildSuccess('');
    try {
      const response = await axios.post('http://localhost:5001/add-child', { parentName, childName });
      setChildSuccess(response.data.message);
      setParentName('');
      setChildName('');
      fetchPeople(); // Fetch people again to update the tree
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setChildError('Parent or child not found');
      } else {
        setChildError('An error occurred');
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
      case 'addChild':
        return (
          <form onSubmit={addChild}>
            <div>
              <label>Parent Name: </label>
              <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} />
            </div>
            <div>
              <label>Child Name: </label>
              <input type="text" value={childName} onChange={e => setChildName(e.target.value)} />
            </div>
            <button type="submit">Add Child</button>
            {childError && <p>{childError}</p>}
            {childSuccess && <p>{childSuccess}</p>}
          </form>
        );
      default:
        return <p>Please select an option from the menu.</p>;
    }
  };

  const generateTreeData = () => {
    const findPersonNode = (name) => people.find(person => person.name === name);

    const buildNode = (person, visited = new Set()) => {
      if (!person || visited.has(person.name)) return null;

      visited.add(person.name);

      const childrenNodes = person.children.map(childName => buildNode(findPersonNode(childName), visited)).filter(child => child !== null);

      const node = {
        name: person.name,
        attributes: {
          sex: person.sex,
          dob: person.dob,
        },
        children: childrenNodes,
      };

      if (person.spouse) {
        const spouseNode = findPersonNode(person.spouse);
        if (spouseNode) {
          node.children.unshift({
            name: spouseNode.name,
            attributes: {
              sex: spouseNode.sex,
              dob: spouseNode.dob,
            },
            children: [],
          });
        }
      }

      return node;
    };

    const rootPerson = findPersonNode(rootPersonName);
    const rootNode = rootPerson ? buildNode(rootPerson) : null;

    return rootNode ? [rootNode] : [];
  };

  const nodeSvgShape = {
    shape: 'circle',
    shapeProps: {
      r: 10,
      fill: 'blue',
    },
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
          <option value="addChild">Add Child</option>
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
        {rootPersonName && (
          <Tree
            data={generateTreeData()}
            orientation="vertical"
            translate={{ x: 200, y: 50 }}
            nodeSvgShape={nodeSvgShape}
            nodeSize={{ x: 200, y: 100 }}
            styles={{
              links: {
                stroke: 'black',
                strokeWidth: 2,
              },
              nodes: {
                node: {
                  circle: {
                    fill: 'blue',
                  },
                },
                leafNode: {
                  circle: {
                    fill: 'green',
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;


