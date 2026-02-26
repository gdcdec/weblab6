import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import Button from '../Button/Button';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const {user, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate to home first to leave any protected pages
    navigate('/', {replace: true});
    // Short delay ensures navigation is processed before clearing auth
    setTimeout(() => {
      logout();
    }, 50);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/logo.png" alt="Event Manager" className={styles.logoImg} />
          <span>Event Manager</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        {user ? (
          <>
            <span className={styles.user}>Hello, {user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Register</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
