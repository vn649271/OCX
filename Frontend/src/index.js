import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// ******  BEGIN OF PATCH BY cowboy 12/02/2021 ***************
import RecaptchaComponent from './components/common/Recaptcha'
// ******  END OF PATCH BY cowboy 12/02/2021 *****************

ReactDOM.render(
  <React.StrictMode>
    <App />
    {/*******  BEGIN OF PATCH BY cowboy 12/02/2021 ********/}
    <RecaptchaComponent />
    {/*******  END OF PATCH BY cowboy 12/02/2021 **********/}
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
