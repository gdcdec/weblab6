import React, {useEffect, useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {getEvents, createEvent, deleteEvent} from '../../api/eventService';
import {useAuth} from '../../contexts/AuthContext';
import EventCard from './components/EventCard';
import Button from '../../components/Button/Button';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Events.module.scss';
import type {Event} from '../../types/event';

type DateFilter = 'all' | 'today' | 'week' | 'month';

// Helper to extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as any;
    return err.response?.data?.message || err.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'education' as const,
  });
  const [submitting, setSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const navigate = useNavigate();
  const {user, isLoading: authLoading} = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchEvents();
    }
  }, [user, authLoading, navigate]);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const dateIso = new Date(formData.date).toISOString();
      await createEvent({
        title: formData.title,
        description: formData.description || null,
        date: dateIso,
        category: formData.category,
        createdBy: user.id,
      });
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        category: 'education',
      });
      fetchEvents();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setEventToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setSubmitting(true);
    try {
      await deleteEvent(eventToDelete);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setDeleteModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Date filter logic – fixed no-case-declarations by using {}
  const filteredEvents = useMemo(() => {
    if (dateFilter === 'all') return events;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      switch (dateFilter) {
        case 'today': {
          const tomorrow = new Date(today.getTime() + 86400000);
          return eventDate >= today && eventDate < tomorrow;
        }
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 86400000);
          return eventDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 86400000);
          return eventDate >= monthAgo;
        }
        default:
          return true;
      }
    });
  }, [events, dateFilter]);

  if (authLoading)
    return <div className={styles.loading}>Checking authentication...</div>;
  if (loading) return <div className={styles.loading}>Loading events...</div>;

  return (
    <div className={styles.events}>
      <h1>Events</h1>
      <ErrorDisplay message={error} onClose={() => setError(null)} />

      {events.length > 0 && (
        <div className={styles.controls}>
          <div className={styles.filter}>
            <label htmlFor="dateFilter">Show: </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              disabled={submitting}
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            New event
          </Button>
        </div>
      )}

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>Events. No any</p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            New event
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className={styles.noMatch}>
          No events match the selected filter.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div className={styles.field}>
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="date">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                >
                  <option value="education">Education</option>
                  <option value="amusement">Amusement</option>
                  <option value="work">Work</option>
                  <option value="hobby">Hobby</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={`${styles.modal} ${styles.deleteModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Deletion</h3>
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
