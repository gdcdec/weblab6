import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import styles from './App.module.scss';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
