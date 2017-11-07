// @flow
import _ from 'underscore';
import storage from 'electron-json-storage';

import type { CheckoutProfile, AppSettings } from '../globals';

class CacheException extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, CacheException);
  }
}

export const loadProfiles = () => {
  console.log('[INTERNAL] Loading profiles from cache.');
  console.log('[INTERNAL] Internal cache location: ', storage.getDataPath());

  return new Promise((resolve, reject) => {
    storage.get('profiles', (error, profiles) => {
      if (error) {
        return reject(new CacheException(error));
      }

      console.log('[INTERNAL] Profiles loaded: ', profiles);
      return resolve(profiles);
    });
  });
};

export const saveProfiles = (profiles: Array<CheckoutProfile>) => {
  console.log('[INTERNAL] Saving profiles to cache.');

  return new Promise((resolve, reject) => {
    storage.set('profiles', profiles, (error) => {
      if (error) {
        return reject(new CacheException(error));
      }

      console.log('[INTERNAL] Profiles saved to cache');
      return resolve();
    });
  });
};

export const removeProfile = (id: string) => {
  console.log(`[INTERNAL] Removing profile with id '${id}'`);

  return new Promise((resolve, reject) => {
    // fetch current cache
    storage.get('profiles', (fetchError, profiles) => {
      if (fetchError) {
        return reject(new CacheException(fetchError));
      }

      const prof = _.findWhere(profiles, { id });
      const newProfiles = _.without(profiles, prof);

      storage.set('profiles', newProfiles, (saveError) => {
        if (saveError) {
          return reject(new CacheException(saveError));
        }

        console.log('[INTERNAL] New profile data saved to cache');
        return resolve();
      });
    });
  });
};


// App settings
export const loadSettings = () => {
  console.log('[INTERNAL] Loading app settings from cache.');

  return new Promise((resolve, reject) => {
    storage.get('settings', (error, app) => {
      if (error) {
        return reject(new CacheException(error));
      }

      console.log('[INTERNAL] Settings loaded: ', app);
      return resolve(app);
    });
  });
};

export const saveSettings = (appSettings: AppSettings) => {
  console.log('[INTERNAL] Saving app settings to cache.');

  return new Promise((resolve, reject) => {
    storage.set('settings', appSettings, (error) => {
      if (error) {
        return reject(new CacheException(error));
      }

      console.log('[INTERNAL] App settings saved to cache');
      return resolve();
    });
  });
};
