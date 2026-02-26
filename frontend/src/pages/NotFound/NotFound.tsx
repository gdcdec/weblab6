import React from 'react';
import {Link} from 'react-router-dom';
import Button from '../../components/Button/Button';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src="/404.png" alt="404 Not Found" className={styles.image} />
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">
        <Button variant="primary">Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
