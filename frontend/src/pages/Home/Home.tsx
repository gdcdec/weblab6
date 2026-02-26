import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import Button from '../../components/Button/Button';
import styles from './Home.module.scss';

const Home: React.FC = () => {
  const {user} = useAuth();

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <img
          src="/logo-large.png"
          alt="Event Manager Logo"
          className={styles.logo}
        />
        <h1>Event Manager</h1>
        <p className={styles.description}>
          Organize and discover events effortlessly. Join us to create, manage,
          and participate in amazing events.
        </p>
        <div className={styles.actions}>
          {user ? (
            <Link to="/events">
              <Button variant="primary">Browse Events</Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
