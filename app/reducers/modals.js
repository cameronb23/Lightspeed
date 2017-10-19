// @flow
import { SHOW_SPINNER, HIDE_SPINNER } from '../actions/modals';

export type spinnerStateType = {
  visible: boolean
};

type actionType = {
  +type: string
};

export default function modals(state: boolean = false, action: actionType) {
  switch (action.type) {
    case SHOW_SPINNER:
      return true;
    case HIDE_SPINNER:
      return false;
    default:
      return state;
  }
}
