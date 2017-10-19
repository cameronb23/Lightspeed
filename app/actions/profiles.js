// @flow
import type { CheckoutProfile } from '../globals';

export const ADD_PROFILE = 'PROFILE_ADD';
export const REMOVE_PROFILE = 'PROFILE_REMOVE';
export const UPDATE_PROFILE = 'PROFILE_UPDATE';


let counter = 0;

export function addTask(profile: CheckoutProfile) {
  counter += 1;
  const newProfile = Object.assign({}, profile, {
    id: counter
  });
  return {
    type: ADD_PROFILE,
    id: counter,
    data: newProfile
  };
}

export function removeTask(profileId: number) {
  return {
    type: REMOVE_PROFILE,
    id: profileId
  };
}

export function updateProfile(profileId: number, newData: CheckoutProfile) {
  return {
    type: UPDATE_PROFILE,
    id: profileId,
    data: newData
  };
}
