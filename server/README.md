- Dependencies
express
express-flash
express-session
dotenv
http-errors
cookie-parser
morgan
passport
cookie-session
mysql
nodemailer
rand-token
request
passport-google-oauth2

- Server Port requirement
Port must be 5000. This value was registered with OAuth2.

- Before run start backend
You must set project client id for Google Cloud Platform.
    https://cloud.google.com/docs/authentication/getting-started#windows
For command prompt:
    set GOOGLE_APPLICATION_CREDENTIALS=KEY_PATH
Replace KEY_PATH with the path of the JSON file that contains your service account key.