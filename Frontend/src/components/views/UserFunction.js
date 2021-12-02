import axios from "axios";


export const register = newUser => {
  return axios
    .post("http://localhost:5000/users/register", {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      password: newUser.password,
      country: newUser.country
    })
    .then(res => {      
    });
};

export const login = user => {
    return axios
      .post('http://localhost:5000/users/login', {
        email: user.email,
        password: user.password
      })
      .then(response => {
        localStorage.setItem('usertoken', response.data)
        return response.data
      })
      .catch(err => {
        alert(err)
    })
}

export const verifyRecaptcha = (token, onResponse) => {
  return axios
    .post('http://localhost:5000/recaptcha', {
      "g-recaptcha-response": token
    })
    .then(response => {
      if (response == undefined || response == null ||
      response.data == undefined || response.data == null ||
      response.data.verify == undefined || response.data.verify == null ||
      response.data.verify - 0 == 0) {
        alert("Failed to verify recaptcha");
        return;
      }
      onResponse(response.data.verify);
    })
    .catch(err => {
      alert(err)
  })
}