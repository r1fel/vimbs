import React from 'react';
import googleImage from '../../assets/googleImage.png';
import styles from './LoginPage.module.css';
import axios from 'axios';

export default function LoginPage() {
  const googleLogin4000 = () => {
    window.open('http://localhost:4000/auth/google', '_self');
  };

  const googleLogin8080 = () => {
    window.open('http://localhost:8080/auth/google', '_self');
  };

  // const handleLogin = async (username: string, password: string) => {
  //   const response = await axios.post(
  //     'http://localhost:4000/auth/username',
  //     { username, password },
  //     { withCredentials: true }
  //   );
  //   console.log(response);
  // };

  // const handleLoginUsername = (event) => {
  //   event.preventDefault();
  //   handleLogin('bob', 'bob');
  // };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginForm}>
        <h1>Login 4000</h1>
        <div className={styles.googleContainer} onClick={googleLogin4000}>
          <img src={googleImage} alt="Google Icon" />
          <p>Login With Google on 4000</p>
        </div>
        {/* <div>
          <button onClick={handleLoginUsername}>username</button>
        </div> */}
      </div>

      <div className={styles.loginForm}>
        <h1>Login 8080</h1>
        <div className={styles.googleContainer} onClick={googleLogin8080}>
          <img src={googleImage} alt="Google Icon" />
          <p>Login With Google on 8080</p>
        </div>
        {/* <div>
          <button onClick={handleLoginUsername}>username</button>
        </div> */}
      </div>
    </div>
  );
}
