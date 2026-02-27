import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';
import Button from '../../components/Button/Button';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Register.module.scss';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/events');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(resultAction)) {
      navigate('/login');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Register</h2>
        <ErrorDisplay message={error} onClose={() => dispatch(clearError())} />

        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>

        <p className={styles.link}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
