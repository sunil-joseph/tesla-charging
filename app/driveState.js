const rp = require('request-promise');

const getDriveState = (accessToken, vehicleId) => new Promise((resolve, reject) => {
  const options = {
    method: 'GET',
    url: `${process.env.BASE_URL}/api/1/vehicles/${vehicleId}/data_request/drive_state`,
    headers: {
      'User-Agent': 'Sunil\'s Charging App',
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
  };

  rp(options)
    .then((data) => {
      resolve(data.response);
    })
    .catch((error) => {
      reject(error);
    });
});

module.exports = { getDriveState };
