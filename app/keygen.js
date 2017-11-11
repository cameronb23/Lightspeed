const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const request = require('request-promise');

const store = new Store();

// Account and product IDs. You can get this information by logging into your
// dashboard: https://app.keygen.sh
const KEYGEN_ACCOUNT_ID = '23924206-776c-4b65-8809-d582882f8e9e';
const KEYGEN_PRODUCT_ID = '3a114ddb-cdf1-4c31-81bf-3c8e13c7c2b9';

module.exports.accountId = KEYGEN_ACCOUNT_ID;
module.exports.productId = KEYGEN_PRODUCT_ID;

// Base vars for requests
const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`;
const KEYGEN_REQUEST_HEADERS = {
  Accept: 'application/vnd.api+json'
};

// Policies representing our product's features. You can get this information
// from your dashboard: https://app.keygen.sh
const KEYGEN_FEATURE_1 = '720f440c-95c6-4fcb-b5a9-046ade0ab715';
// const KEYGEN_FEATURE_2 = 'dd025847-42fb-49b0-b898-80c34d7734b4';
// const KEYGEN_FEATURE_3 = 'b6a5ae11-ec60-4ecd-9902-ae48a1077623';

module.exports.appFeatures = {
  KEYGEN_FEATURE_1
  // KEYGEN_FEATURE_2,
  // KEYGEN_FEATURE_3
};

// Get an existing session (if one exists and has not expired)
async function getSession() {
  let session = store.get('session');

  if (session != null) {
    session = JSON.parse(session);

    // Make sure our session has not expired
    if (session.expiry == null || Date.parse(session.expiry) > Date.now()) {
      try {
        const response = await request({
          url: 'https://shielded-journey-67207.herokuapp.com/activation/validate',
          method: 'POST',
          json: true,
          body: {
            productName: 'Lightspeed',
            licenseKey: session.token,
          },
          simple: false,
          resolveWithFullResponse: true
        });

        // Get the newly created authentication token
        const { statusCode } = response;

        if (statusCode !== 200) {
          clearSession();
        }

        return session;
      } catch (e) {
        console.log('Could not validate session.');
        return session;
      }
    }
  }

  return null;
}

module.exports.getSession = getSession;

// Clear an existing session and revoke the session's token
function clearSession() {
  store.delete('session');

  ipcRenderer.send('unauthenticated');
}

module.exports.clearSession = clearSession;

// Authenticate the user and create a new token if one is not in local storage
async function createSession(email, password, key) {
  console.log(`Sending key: ${key}`);
  try {
    const response = await request({
      url: 'https://shielded-journey-67207.herokuapp.com/activation/activate',
      method: 'POST',
      json: true,
      body: {
        email,
        password,
        licenseKey: key,
        productName: 'Lightspeed'
      }
    });

    // Get the newly created authentication token
    const { success, token, expiry } = response;

    if (!success) {
      return { errors: [{
        title: 'Error',
        detail: response.message
      }] };
    }

    // Store session
    store.set('session', JSON.stringify({ token, expiry }));

    return { token, expiry };
  } catch (e) {
    console.log(e);
    return { errors: [{ title: 'Error', detail: 'Unable to validate license information.' }] };
  }
}

module.exports.createSession = createSession;

// Get all of the user's licenses for the product
const validatedLicenses = {
  [KEYGEN_FEATURE_1]: {}
  // [KEYGEN_FEATURE_2]: {},
  // [KEYGEN_FEATURE_3]: {}
};

function resetValidatedLicenses() {
  Object.keys(validatedLicenses).forEach(key => {
    validatedLicenses[key] = {};
  });
}

module.exports.resetValidatedLicenses = resetValidatedLicenses;

async function getLicenses(revalidate = false) {
  const session = getSession();
  if (session == null) {
    ipcRenderer.send('unauthenticated');
  }

  if (!revalidate && Object.values(validatedLicenses).every(l => Object.keys(l).length)) {
    return {
      licenses: validatedLicenses
    };
  }

  try {
    const response = await request({
      url: `${KEYGEN_REQUEST_BASEURL}/licenses?product=${KEYGEN_PRODUCT_ID}`,
      method: 'GET',
      headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
        Authorization: `Bearer ${session.token}`
      }),
      simple: false,
      resolveWithFullResponse: true,
      json: true
    });

    // Handle case where the token that we've stored in a session has expired
    // or has been revoked
    if (response.statusCode === 401) {
      return clearSession();
    }

    const { data, errors } = response.body;
    if (errors) {
      return { errors };
    }

    const validations = data.map(async license => {
      const { id, relationships: { policy: { data: policy } } } = license;

      let vResponse;
      let meta;
      let vData;

      switch (policy.id) {
        case KEYGEN_FEATURE_1:
        // case KEYGEN_FEATURE_2:
        // case KEYGEN_FEATURE_3:
          try {
            vResponse = await request({
              url: `${KEYGEN_REQUEST_BASEURL}/licenses/${id}/actions/validate`,
              method: 'GET',
              headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
                Authorization: `Bearer ${session.token}`
              }),
              json: true
            });

            meta = vResponse.body.meta;
            vData = vResponse.body.data;
            validatedLicenses[policy.id] = { meta, vData };

            break;
          } catch (e) {
            break;
          }
        default:
          // This version of our app doesn't use this policy so it's okay to skip it
          break;
      }

      return Promise.resolve();
    });

    // Wait for validations to finish
    await Promise.all(validations);

    // Return an object containing the validated licenses for the user
    return {
      licenses: validatedLicenses
    };
  } catch (e) {
    return null;
  }
}

module.exports.getLicenses = getLicenses;
