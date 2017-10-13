// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import tasks from './tasks';

const rootReducer = combineReducers({
  tasks,
  router,
});

export default rootReducer;
