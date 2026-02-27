import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../Button/Button';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logout());
    navigate('/', { replace: true });
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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
            <Link to="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline">Events</Button>
            </Link>
            <Button variant="outline" onClick={handleLogoutClick}>
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

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleLogoutCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={handleLogoutCancel}>
                No
              </Button>
              <Button variant="primary" onClick={handleLogoutConfirm}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
