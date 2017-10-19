// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import tasks from './tasks';
import profiles from './profiles';

const rootReducer = combineReducers({
  tasks,
  profiles,
  router
});

export default rootReducer;
