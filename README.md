# Tesla Charging
Utility to limit charging during Super Off-Peak periods

# Prerequisite:
* Node JS
* Homebrew (MacOS or Linux)
* MongoDB
* Environment File

## Node JS
https://nodejs.org

Install the latest LTS version

## Homebrew
https://brew.sh/

## MongoDB
```
brew install mongodb
```

## Environment FIle
Create a file ".env". The content of the file should have your variables so the app will work.
```
CLIENT_ID=<add client id>
CLIENT_SECRET=<add client secret>
BASE_URL=https://owner-api.teslamotors.com
MLAB_URI=mongodb://localhost/tesla-app
email=<replace with your email address on your Tesla account>
password=<replace with your password on your Tesla account>
```

## Create Home Location
Update the home.json and update the coordinates for your home. Go to Google Maps and search for your home.

For example, if I search for Tesla HQ, the url is as follows:
```
https://www.google.com/maps/place/Tesla+HQ/@37.3947057,-122.1525138,17z/data=!3m1!4b1!4m5!3m4!1s0x808fb075776f1c3b:0xccc17e4da6b38370!8m2!3d37.3947057!4d-122.1503251
```

The coordinates is the two numbers after the @ symbol in a latitude-longitude format.

In home.json, the coordinates follow a longitude-latitude format (NOTE: In reverse from the URL).
So in home.json it would look as follows:

```
{
    "location": {
        "type": "Point",
        "coordinates":[ -122.1525138, 37.3947057 ]
    }
}
```

## Create Times
By default, it is set to stop charging at 6 am (Monday to Friday) and at 2 pm (Saturday & Sunday). It can also restart
charging if your Energy provider provides that. To modify the times, update the charge.json located in the json folder.

Day of the week goes from 0-6 with Sunday being 0 and Saturday being 6.
Hour is 24 hour time, so 6 am is 6 and 2 pm is 14.

# Documentation:
Once all the prerequisites are done, start mongo daemon.

```
> mongod --dbpath ~/data/db/
```

"~/data/db" is the folder location where you want your Mongo Database to be.

Then you'll want to call the following two commands:

```
npm run setup
npm run start
```

# Legal Agreement/ Disclaimer
This program is provided as is. This program is not supported or endorsed by Tesla. By using this software, you agree to not hold me (Sunil Joseph) liable for anything.
