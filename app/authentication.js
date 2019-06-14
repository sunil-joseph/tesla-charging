/* eslint-disable no-param-reassign */
const rp = require('request-promise');
const moment = require('moment');
const { User } = require('../schema/user');

const retrieveTokenFromApi = args => new Promise((resolve, reject) => {
  const { refreshToken, email, password } = args;

  const options = {
    method: 'POST',
    url: `${process.env.BASE_URL}/oauth/token?grant_type=`,
    headers: {
      'User-Agent': 'Sunil\'s Test App',
    },
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    },
    json: true,
  };

  if (refreshToken) {
    // Refresh token is passed in, get the access token via refresh token
    options.url = `${options.url}refresh_token`;
    options.body.grant_type = 'refresh_token';
    options.body.refresh_token = refreshToken;
  } else {
    // No refresh token provided, use email & password from .env file
    options.url = `${options.url}password`;
    options.body.grant_type = 'password';
    options.body.email = email;
    options.body.password = password;
  }

  rp(options)
    .then((data) => {
      // eslint-disable-next-line max-len
      const { access_token: accessToken, refresh_token: newRefreshToken, expires_in: expiresIn } = data;
      const expirationDate = moment().add(expiresIn, 'second').toDate();

      resolve({ accessToken, refreshToken: newRefreshToken, expirationDate });
    })
    .catch((error) => {
      reject(error);
    });
});

/*
 * Gets the access token by either authenticating
 * the user via email & password or by using the
 * refresh token
 */
const getAcessToken = (email, password) => new Promise(async (resolve) => {
  /*
   * Checks to see if a user exists in the database.
   * If it exists, it'll use the access token, otherwise
   * it will make a call to the Tesla API and authenticate
   */
  let user = await User.findOne({ email: process.env.email });
  if (user) {
    /*
      * The user exist in the database
      * check to see if the access token is still valid
      */
    const today = moment();
    const expirationDate = moment(user.expirationDate);

    if (expirationDate.isBefore(today)) {
      // Access token is no longer valid, get a new token
      const { refreshToken } = user;
      const data = await retrieveTokenFromApi({ refreshToken });
      user.accessToken = data.accessToken;
      user.refreshToken = data.refreshToken;
      user.expirationDate = data.expirationDate;
      user.save()
        .then(() => {
          resolve(user.accessToken);
        });

      resolve(user.accessToken);
    } else {
      resolve(user.accessToken);
    }
  } else {
    /*
     * The user doesn't exist in the database
     * must log in to get access token
     */
    const data = await retrieveTokenFromApi({ email, password });
    user = new User();
    user.email = email;
    user.accessToken = data.accessToken;
    user.refreshToken = data.refreshToken;
    user.expirationDate = data.expirationDate;
    user.save()
      .then(() => {
        resolve(user.accessToken);
      });
  }
});

module.exports = { getAcessToken };
