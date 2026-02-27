import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setFilter,
  clearError,
} from '../../store/slices/eventsSlice';
import type { DateFilter } from '../../store/slices/eventsSlice'; // ← type-only import
import EventCard from './components/EventCard';
import EventForm from '../../components/EventForm/EventForm';
import type { EventFormValues } from '../../components/EventForm/EventForm'; // ← type-only import
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Events.module.scss';
import type { Event } from '../../types/event'; // ← type-only import

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error, filter } = useAppSelector(
    (state) => state.events
  );
  const { user } = useAppSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditModal = (id: number) => {
    const event = events.find((e) => e.id === id);
    if (event) {
      setEditingEvent(event);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (data: EventFormValues) => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Convert empty description to null for API
      const payload = {
        ...data,
        description: data.description || null,
        createdBy: user.id,
      };

      if (editingEvent) {
        await dispatch(
          updateEvent({ id: editingEvent.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createEvent(payload)).unwrap();
      }
      closeModal();
    } catch {
      // error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

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

  // Filter events based on selected filter
  const filteredEvents = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      switch (filter) {
        case 'today':
          return (
            eventDate >= today &&
            eventDate < new Date(today.getTime() + 86400000)
          );
        case 'week':
          return eventDate >= new Date(today.getTime() - 7 * 86400000);
        case 'month':
          return eventDate >= new Date(today.getTime() - 30 * 86400000);
        default:
          return true;
      }
    });
  })();

  if (loading && !events.length) return <Loading />;

  return (
    <div className={styles.events}>
      <h1>Events</h1>
      <ErrorDisplay message={error} onClose={() => dispatch(clearError())} />

      <div className={styles.controls}>
        <div className={styles.filter}>
          <label htmlFor="filter">Show: </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => dispatch(setFilter(e.target.value as DateFilter))}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          New Event
        </Button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No events found.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteClick}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
            <EventForm
              initialValues={
                editingEvent
                  ? {
                      title: editingEvent.title,
                      description: editingEvent.description || '',
                      date: editingEvent.date,
                      category: editingEvent.category,
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

export default Events;
