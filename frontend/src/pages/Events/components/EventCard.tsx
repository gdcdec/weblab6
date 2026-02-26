import React from 'react';
import type {Event} from '../../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({event}) => {
  const date = new Date(event.date).toLocaleString();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{event.title}</h3>
      <p className={styles.category}>Category: {event.category}</p>
      {event.description && (
        <p className={styles.description}>{event.description}</p>
      )}
      <p className={styles.date}>Date: {date}</p>
    </div>
  );
};

export default EventCard;
