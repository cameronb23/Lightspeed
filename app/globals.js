// @flow

export type CheckoutProfile = {
  id: ?number,
  email: string,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string,
  zip: string,
  city: string,
  state: string,
  phoneNumber: string,
  payment: {
    cardNumber: string,
    cardName: string,
    cvv: string,
    expMonth: number,
    expYear: number
  }
};
