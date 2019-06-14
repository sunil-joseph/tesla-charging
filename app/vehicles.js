const rp = require('request-promise');
const _ = require('lodash');
const { User } = require('../schema/user');
const { Vehicle } = require('../schema/vehicle');

/*
 * Gets the vehicles from the API
 * If there's a new vehicle, add it to the database
 */
const getVehiclesFromApi = () => new Promise(async (resolve, reject) => {
  const user = await User.findOne({ email: process.env.email }, 'accessToken');
  const vehicles = await Vehicle.find({ userId: user.id });

  const options = {
    method: 'GET',
    url: `${process.env.BASE_URL}/api/1/vehicles`,
    headers: {
      'User-Agent': 'Sunil\'s Test App',
      Authorization: `Bearer ${user.accessToken}`,
    },
    json: true,
  };

  rp(options)
    .then((data) => {
      const { response: vResponse } = data;

      // eslint-disable-next-line no-console
      console.log(`Retrieved ${vResponse.length} vehicle from the API.`);

      const allVehicles = [];
      let newVehicles = 0;

      // Loop through all the vehicles
      vResponse.forEach((v) => {
        // Check to see if it exists in the database
        let vehicle = _.chain(vehicles).find({ vehicleId: v.id_s }).value();

        if (!vehicle) {
          // Vehicle doesn't exist, add it to the database
          vehicle = new Vehicle({
            userId: user.id,
            vehicleId: v.id_s,
            displayName: v.display_name,
          });
          vehicle.save();

          newVehicles += 1;
        }

        // Add the vehicles to the array
        allVehicles.push(vehicle);
      });

      // eslint-disable-next-line no-console
      console.log(`${newVehicles} vehicles were added to the database.`);

      resolve(allVehicles);
    })
    .catch((error) => {
      reject(error);
    });
});

module.exports = { getVehiclesFromApi };
