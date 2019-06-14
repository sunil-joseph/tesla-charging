const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { getVehiclesFromApi } = require('./app/vehicles');
const { getAcessToken } = require('./app/authentication');

const { User } = require('./schema/user');
const { Home } = require('./schema/home');
const { Charge } = require('./schema/charge');

const homeJson = require('./json/home.json');
const chargeArray = require('./json/charge.json');

dotenv.config();

mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true });

async function start() {
  try {
    await getAcessToken(process.env.email, process.env.password);
    await getVehiclesFromApi();

    const user = await User.findOne({ email: process.env.email });
    if (user) {
      homeJson.userId = user.id;
      const homeDoc = new Home(homeJson);
      homeDoc.save()
        .then(() => {
          let size = chargeArray.length;

          chargeArray.forEach((chargeJson) => {
            const chargeDoc = new Charge(chargeJson);
            chargeDoc.save()
              .then(() => {
                size -= 1;
                if (size === 0) {
                  // exit once the vehicles have be received
                  process.exit();
                }
              });
          });
        });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    // Exit with error
    process.exit(1);
  }
}

start();
