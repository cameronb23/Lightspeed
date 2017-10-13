// @flow
// import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../actions/counter';

type actionType = {
  +type: string
};

export default function tasks(state: Array = [], action: actionType) { // eslint-disable-line flowtype-errors/show-errors max-len
  switch (action.type) {
    default:
      return state;
  }
}
