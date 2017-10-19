function Task(id) {
  this.id = id;
}

Task.prototype.start = () => {
  console.log('Undefined start method. Please define one.');
};

Task.prototype.stop = () => {
  console.log('Undefined stop method. Please define one.');
};


export default Task;
