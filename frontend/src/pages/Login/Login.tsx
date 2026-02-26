import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {login as apiLogin} from '../../api/authService';
import {getUsers} from '../../api/userService';
import {setAccessToken, setRefreshToken} from '../../utils/storage';
import {decodeToken} from '../../utils/token';
import {useAuth} from '../../contexts/AuthContext';
import Button from '../../components/Button/Button';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {user, login} = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/events');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Perform login request
      const loginResponse = await apiLogin({email, password});
      const {accessToken, refreshToken} = loginResponse;

      // 2. Store tokens IMMEDIATELY so they are available for subsequent requests
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      // 3. Decode token to get user ID
      const payload = decodeToken(accessToken);
      if (!payload) {
        throw new Error('Invalid token');
      }

      // 4. Fetch user details (now authenticated because tokens are stored)
      const users = await getUsers();
      const currentUser = users.find((u) => u.id === payload.id);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // 5. Update auth context with user (tokens are already stored)
      login(accessToken, refreshToken, currentUser);

      navigate('/events');
    } catch (err: any) {
      // Clear any partially stored tokens on error
      setAccessToken('');
      setRefreshToken('');
      const message =
        err.response?.data?.message || err.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login</h2>
        <ErrorDisplay message={error} onClose={() => setError(null)} />

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p className={styles.link}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
