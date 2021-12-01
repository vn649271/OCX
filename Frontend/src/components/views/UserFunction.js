import axios from "axios";


export const register = newUser => {
  return axios
    .post("http://localhost:8080/users/register", {
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
      .post('http://localhost:8080/users/login', {
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
