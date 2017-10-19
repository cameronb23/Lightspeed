/* eslint max-len: 0 */
// @flow
import _ from 'underscore';
import type { CheckoutProfile } from '../globals';
// import { Task } from '../tasks';
import { ADD_TASK, UPDATE_TASK, REMOVE_TASK } from '../actions/tasks';

export type actionType = {
  type: string,
  id: number,
  data: TaskType,
  status: ?string
};

export type TaskType = {
  id: number,
  type: string,
  url: string,
  checkout_profile: CheckoutProfile,
  data: Object, // eslint-disable-line flowtype/no-weak-types
  proxies: Array<string>,
  status: string
};


export type taskStateType = Array<TaskType>;

export default function tasks(state: taskStateType = [], action: actionType) { // eslint-disable-line max-len
  switch (action.type) {
    case ADD_TASK: {
      if (action.data === null) {
        return state;
      }

      const result = _.findWhere(state, { id: action.id });

      if (result != null) {
        console.log('Found task matching given ID.');
        return state;
      }

      const data = Object.assign({}, action.data, {
        id: action.id
      });

      return state.concat(data);
    }
    case REMOVE_TASK: {
      if (action.taskId === null) {
        console.log('Must pass task ID to REMOVE_TASK action.');
        return state;
      }

      const obj = _.findWhere(state, { id: action.id });
      return _.without(state, obj); // eslint-disable-line flowtype-errors/show-errors
    }
    case UPDATE_TASK: {
      if (action.id == null || action.status == null) {
        console.log('Must pass task ID & task status to UPDATE_TASK action.');
        return state;
      }

      const obj = _.findWhere(state, { id: action.id }); // eslint-disable-line flowtype-errors/show-errors
      const arr = _.without(state, obj); // eslint-disable-line flowtype-errors/show-errors
      obj.status = action.status;
      arr.push(obj);
      return arr;
    }
    default:
      return state;
  }
}
