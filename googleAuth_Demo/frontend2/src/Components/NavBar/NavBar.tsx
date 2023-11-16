import React from 'react';
import styles from './NavBar.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { myContext } from '../../Context';
import { IUser } from '../../types/maintypes';

export default function NavBar() {
  const userObject = useContext(myContext) as IUser;

  const logout4000 = () => {
    axios
      .get('http://localhost:4000/auth/logout', { withCredentials: true })
      .then((res: AxiosResponse) => {
        if (res.data === 'done') {
          window.location.href = '/';
        }
      });
  };

  const logout8080 = () => {
    axios
      .get('http://localhost:8080/auth/logout', { withCredentials: true })
      .then((res: AxiosResponse) => {
        if (res.data === 'done') {
          window.location.href = '/';
        }
      });
  };

  return (
    <div className={styles.navBarWrapper}>
      <ul className={styles.navBar}>
        <li>
          <Link to="/">Home</Link>
        </li>

        {userObject ? (
          <div>
            <li onClick={logout4000}>Logout 4000 </li>
            <li onClick={logout8080}>Logout 8080 </li>
          </div>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </div>
  );
}
