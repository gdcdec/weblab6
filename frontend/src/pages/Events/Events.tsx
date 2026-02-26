// frontend/src/pages/Events/Events.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getEvents, createEvent} from '../../api/eventService';
import {useAuth} from '../../contexts/AuthContext';
import EventCard from './components/EventCard';
import Button from '../../components/Button/Button';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Events.module.scss';

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'education' as const,
  });
  const [submitting, setSubmitting] = useState(false);
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
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load events';
      setError(message);
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
      // Convert datetime-local to ISO string
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
      fetchEvents(); // refresh list
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to create event';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading)
    return <div className={styles.loading}>Checking authentication...</div>;
  if (loading) return <div className={styles.loading}>Loading events...</div>;

  return (
    <div className={styles.events}>
      <h1>Events</h1>
      <ErrorDisplay message={error} onClose={() => setError(null)} />

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No any</p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            New event
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className={styles.createButton}>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              New event
            </Button>
          </div>
        </>
      )}

      {/* Modal for creating event */}
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
    </div>
  );
};

export default Events;
