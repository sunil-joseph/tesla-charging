const dotenv = require('dotenv');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const moment = require('moment');
const rp = require('request-promise');

const { getDriveState } = require('./app/driveState');

const { User } = require('./schema/user');
const { Home } = require('./schema/home');
const { Vehicle } = require('./schema/vehicle');
const { Charge } = require('./schema/charge');

dotenv.config();

mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true });

/*
 * Start/Stop charging function based on the action
 */
const charging = async (accessToken, vehicle, action) => {
  // eslint-disable-next-line no-console
  console.info(`${action[0].toUpperCase()}${action.slice(1)} charging for ${vehicle.displayName}`);

  const options = {
    method: 'POST',
    url: `${process.env.BASE_URL}/api/1/vehicles/${vehicle.vehicleId}/command/charge_${action}`,
    headers: {
      'User-Agent': 'Sunil\'s Charging App',
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
  };

  const resp = await rp(options);

  // eslint-disable-next-line no-console
  console.info(resp);
  if (resp.response.result) {
    // eslint-disable-next-line no-console
    console.info(`${vehicle.displayName} did ${action} charging! Reason: ${resp.response.reason}`);
  } else {
    // eslint-disable-next-line no-console
    console.info(`${vehicle.displayName} did not ${action} charging! Reason: ${resp.response.reason}`);
  }
};


/*
 * Schedule a job every hour, check to see if it's home &
 * have a charge document and perform accordingly
 */
schedule.scheduleJob('0 * * * *', async (firedDate) => {
  try {
    // Convert the date to moment so that it's easy to parse
    const mDate = moment(firedDate);

    const dayOfWeek = mDate.day();
    const hour = mDate.hour();

    // eslint-disable-next-line no-console
    console.info(mDate.format('dddd, MMMM Do YYYY, h:mm:ss a'));

    // Find a charge document
    const charge = await Charge.findOne({ dayOfWeek, hour }).exec();

    // Will either return a document or null
    if (charge) {
      // Get the user and associated vecihcles
      const user = await User.findOne({ email: process.env.email }, 'accessToken').exec();
      const vehicles = await Vehicle.find({ userId: user.id }).exec();
      vehicles.forEach(async (vehicle) => {
        // Make Tesla API call
        const driveState = await getDriveState(user.accessToken, vehicle.vehicleId);

        // Get Home Location
        const home = await Home.findOne({
          userId: user.id,
          location: {
            $near: {
              $maxDistance: 100,
              $geometry: {
                type: 'Point',
                coordinates: [
                  driveState.longitude,
                  driveState.latitude,
                ],
              },
            },
          },
        }).exec();

        // Returns home location or null
        if (home) {
          // If close to home, start/stop charging
          try {
            charging(user.accessToken, vehicle, charge.chargeState);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Exit with error
    process.exit(1);
  }
});
