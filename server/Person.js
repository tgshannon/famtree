class Person {
  constructor(name, sex, dob) {
    this.name = name;
    this.sex = sex;
    this.dob = dob;
    this.spouse = null; // Will link to another Person object
    this.children = []; // Will contain an array of Person objects
  }

  // Method to set the spouse
  setSpouse(spouse) {
    if (spouse instanceof Person) {
      this.spouse = spouse;
      spouse.spouse = this; // Ensure the relationship is mutual
    } else {
      throw new Error("Spouse must be a Person object");
    }
  }

  // Method to add a child
  addChild(child) {
    if (child instanceof Person) {
      this.children.push(child);
    } else {
      throw new Error("Child must be a Person object");
    }
  }

  // Method to display information
  displayInfo() {
    return {
      name: this.name,
      sex: this.sex,
      dob: this.dob,
      spouse: this.spouse ? this.spouse.name : 'None',
      children: this.children.map(child => child.name)
    };
  }
}

module.exports = Person;

