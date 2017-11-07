// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';

import { updateProfileStoreSaga, updateSettingsStoreSaga } from '../redux/sagas';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const promise = promiseMiddleware();
const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(thunk, router, promise, sagaMiddleware);

function configureStore(initialState?: Object) {
  const store = createStore(rootReducer, initialState, enhancer);

  sagaMiddleware.run(updateProfileStoreSaga);
  sagaMiddleware.run(updateSettingsStoreSaga);

  return store;
}

export default { configureStore, history };
