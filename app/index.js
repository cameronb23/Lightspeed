
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { loadProfiles } from './utils/cache';
import { setProfiles } from './actions/profiles';
import { configureStore, history } from './store/configureStore';

import './styles.global.css';

const store = configureStore();

loadProfiles().then(profiles => {
  console.log(profiles);
  if (profiles.length > 0) {
    store.dispatch(setProfiles(profiles));
  }
}).catch(err => {
  console.log(err);
});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
