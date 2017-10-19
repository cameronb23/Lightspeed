/* eslint max-len: 0 */
// @flow
import _ from 'underscore';
import type { CheckoutProfile } from '../globals';
import { ADD_PROFILE, REMOVE_PROFILE, UPDATE_PROFILE } from '../actions/profiles';

export type actionType = {
  type: string,
  id: number,
  data: ?CheckoutProfile
};

export type profileStateType = Array<CheckoutProfile>;

export default function profiles(state: profileStateType = [], action: actionType) { // eslint-disable-line max-len
  switch (action.type) {
    case ADD_PROFILE: {
      if (action.data === null) {
        return state;
      }

      const result = _.findWhere(state, { id: action.id });

      if (result != null) {
        console.log('Found profile matching given ID.');
        return state;
      }

      const data = Object.assign({}, action.data, {
        id: action.id
      });

      return state.concat(data);
    }
    case REMOVE_PROFILE: {
      if (action.id === null) {
        console.log('Must pass profile ID to REMOVE_PROFILE action.');
        return state;
      }

      const obj = _.findWhere(state, { id: action.id });
      return _.without(state, obj); // eslint-disable-line flowtype-errors/show-errors
    }
    case UPDATE_PROFILE: {
      if (action.id == null || action.data == null) {
        console.log('Must pass profile ID & updated data to UPDATE_PROFILE action.');
        return state;
      }

      const obj = _.findWhere(state, { id: action.id }); // eslint-disable-line flowtype-errors/show-errors
      const arr = _.without(state, obj); // eslint-disable-line flowtype-errors/show-errors

      const newObj = Object.assign({}, obj, action.data);
      arr.push(newObj);
      return arr;
    }
    default:
      return state;
  }
}
