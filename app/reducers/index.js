// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import app from './app';
import tasks from './tasks';
import profiles from './profiles';
import captchas from './captchas';

const rootReducer = combineReducers({
  app,
  tasks,
  profiles,
  captchas,
  router,
  form: formReducer
});

export default rootReducer;
