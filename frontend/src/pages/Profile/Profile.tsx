import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchMyEvents,
  deleteEvent,
  updateEvent,
  clearError,
} from '../../store/slices/eventsSlice';
import { updateUserProfile } from '../../api/userService';
import { updateUser } from '../../store/slices/authSlice';
import EventCard from '../Events/components/EventCard';
import EventForm from '../../components/EventForm/EventForm';
import type { EventFormValues } from '../../components/EventForm/EventForm';
import Loading from '../../components/Loading/Loading';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import Button from '../../components/Button/Button';
import UserForm from '../../components/UserForm/UserForm';
import type { UserFormValues } from '../../components/UserForm/UserForm';
import type { Event } from '../../types/event';
import styles from './Profile.module.scss';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { myEvents, loading, error } = useAppSelector((state) => state.events);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchMyEvents());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, user, navigate]);

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
      // error handled
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDelete = () => setDeleteId(null);

  const handleEditEvent = (id: number) => {
    const event = myEvents.find((e) => e.id === id);
    if (event) {
      setEditingEvent(event);
      setEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdate = async (data: EventFormValues) => {
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        description: data.description || null,
      };
      await dispatch(
        updateEvent({ id: editingEvent.id, data: payload })
      ).unwrap();
      closeEditModal();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditProfileModal = () => {
    setEditProfileModalOpen(true);
  };

  const closeEditProfileModal = () => {
    setEditProfileModalOpen(false);
    setUpdateError(null);
  };

  const handleUpdateUser = async (data: UserFormValues) => {
    setSubmitting(true);
    try {
      const updated = await updateUserProfile(data);
      dispatch(updateUser(updated));
      closeEditProfileModal();
    } catch (err: any) {
      setUpdateError(
        err.response?.data?.message || err.message || 'Update failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <Button variant="primary" onClick={openEditProfileModal}>
          Edit
        </Button>
      </div>

      <div className={styles.info}>
        <p>
          <strong>First Name:</strong> {user.firstName}
        </p>
        <p>
          <strong>Last Name:</strong> {user.lastName}
        </p>
        <p>
          <strong>Patronymic:</strong> {user.patronymic}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender === 'male' ? 'Male' : 'Female'}
        </p>
        <p>
          <strong>Date of Birth:</strong>{' '}
          {new Date(user.dateOfBirth).toLocaleDateString()}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Registered:</strong>{' '}
          {new Date(user.createdAt).toLocaleDateString()}
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
            onEdit={handleEditEvent}
          />
        ))}
      </div>

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div className={styles.modalOverlay} onClick={closeEditProfileModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <ErrorDisplay
              message={updateError}
              onClose={() => setUpdateError(null)}
            />
            <UserForm
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                patronymic: user.patronymic,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth.split('T')[0],
                email: user.email,
              }}
              onSubmit={handleUpdateUser}
              onCancel={closeEditProfileModal}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editModalOpen && editingEvent && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Event</h3>
            <ErrorDisplay
              message={updateError}
              onClose={() => setUpdateError(null)}
            />
            <EventForm
              initialValues={{
                title: editingEvent.title,
                description: editingEvent.description || '',
                date: editingEvent.date,
                category: editingEvent.category,
              }}
              onSubmit={handleEventUpdate}
              onCancel={closeEditModal}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}

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
