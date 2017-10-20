// @flow

export type CheckoutProfile = {
  id: ?string,
  title: string,
  email: string,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string,
  zip: string,
  city: string,
  state: string,
  country: string,
  phoneNumber: string,
  payment: {
    cardNumber: string,
    cardName: string,
    cvv: string,
    expMonth: number,
    expYear: number
  }
};
