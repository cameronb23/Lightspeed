// @flow

type actionType = {
  +type: string
};

export default function tasks(state: Array = [], action: actionType) { // eslint-disable-line flowtype-errors/show-errors max-len
  switch (action.type) {
    case 'ADD_TASK':
      return Object.assign({}, state, {
        tasks: state.tasks.push(action.task)
      });
    default:
      return state;
  }
}
