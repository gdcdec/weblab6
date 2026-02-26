import React, {useState, useRef, useEffect} from 'react';
import type {Event} from '../../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({event, onDelete}) => {
  const [isClicked, setIsClicked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsClicked(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    setIsClicked((prev) => !prev);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
    setIsClicked(false);
  };

  const date = new Date(event.date).toLocaleString();

  return (
    <div className={styles.card} onClick={handleCardClick} ref={cardRef}>
      <h3 className={styles.title}>{event.title}</h3>
      <p className={styles.category}>Category: {event.category}</p>
      {event.description && (
        <p className={styles.description}>{event.description}</p>
      )}
      <p className={styles.date}>Date: {date}</p>
      {isClicked && (
        <div className={styles.deleteButtonContainer}>
          <button className={styles.deleteButton} onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
