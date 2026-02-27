import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchMyEvents,
  deleteEvent,
  clearError,
} from '../../store/slices/eventsSlice';
import EventCard from '../Events/components/EventCard';
import Loading from '../../components/Loading/Loading';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import Button from '../../components/Button/Button';
import styles from './Profile.module.scss';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { myEvents, loading, error } = useAppSelector((state) => state.events);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyEvents());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await dispatch(deleteEvent(deleteId)).unwrap();
      setDeleteId(null);
    } catch {
      // error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDelete = () => setDeleteId(null);

  const handleEdit = (_id: number) => {
    // Navigate to events page (you could also pass state to open edit modal automatically)
    navigate('/events');
  };

  if (!user) return null;

  return (
    <div className={styles.profile}>
      <h1>My Profile</h1>
      <div className={styles.info}>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <h2>My Events</h2>
      <ErrorDisplay message={error} onClose={() => dispatch(clearError())} />
      {loading && <Loading />}
      {!loading && myEvents.length === 0 && (
        <p className={styles.empty}>You haven't created any events yet.</p>
      )}
      <div className={styles.grid}>
        {myEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onDelete={handleDeleteClick}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={`${styles.modal} ${styles.deleteModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this event?</p>
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={cancelDelete}
                disabled={submitting}
              >
                No
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                disabled={submitting}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
