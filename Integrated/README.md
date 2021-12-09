# React 😎 + Tailwind 💨 Project Starter Template 
Use until create-react-app doesn't support PostCSS 8.

## How to use?
1. Do `git clone https://github.com/tanmayhinge/react-tailwind-template.git` or easily [ Generate template](https://github.com/tanmayhinge/react-tailwind-template/generate)
2. In the command line, do `npm install` to install all the dependencies. 
3. `npm start` ⚙️

## Why did I make this?
I was using Tailwind with react a lot and felt the whole process of setting up tailwind every time quite the fuss.  

#### Why the fuss?
Create React App doesn't support PostCSS 8 yet so you need to install the Tailwind CSS v2.0 PostCSS 7. Also since Create React App doesn't let you override the PostCSS configuration natively, CRACO is used.

#### PS: Star the repo if it helped you ⭐

#### Run concurrently ⭐
    "start": "concurrently --kill-others-on-fail \"nodemon server.js\" \"serve -s build -l 8080\"",
    "dev": "concurrently --kill-others-on-fail \"npm run server-dev\" \"craco start\"",
    "build": "craco build",
    "test": "craco test",
    "eject": "react-scripts eject"    

#### Backend
## Dependencies
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

## Server Port requirement
Port must be 5000. This value was registered with OAuth2.

## Before run start backend
You must set project client id for Google Cloud Platform.
    https://cloud.google.com/docs/authentication/getting-started#windows
For command prompt:
    set GOOGLE_APPLICATION_CREDENTIALS=KEY_PATH
Replace KEY_PATH with the path of the JSON file that contains your service account key.

#### After run "npm run build"
sed 's/<script\ src/<script\ type="text\/javascript"\ src/g' build/index.html > index.1.html
sed 's/<script>!/<script\ type="text\/javascript">!/g' build/index.1.html > index.html


