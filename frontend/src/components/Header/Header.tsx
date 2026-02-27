import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../Button/Button';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
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
