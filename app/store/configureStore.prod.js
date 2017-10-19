// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const promise = promiseMiddleware();
const enhancer = applyMiddleware(thunk, router, promise);

function configureStore(initialState?: Object) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
