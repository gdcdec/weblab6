import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../Button/Button';
import styles from './EventForm.module.scss';

export interface EventFormValues {
  title: string;
  description?: string | null; // allow null/undefined
  date: string;
  category: 'education' | 'amusement' | 'work' | 'hobby' | 'other';
}

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  description: yup.string().nullable().max(500, 'Description too long'),
  date: yup
    .string()
    .required('Date is required')
    .test('future-date', 'Date must be in the future', (value) => {
      if (!value) return false;
      return new Date(value) > new Date();
    }),
  category: yup
    .mixed<'education' | 'amusement' | 'work' | 'hobby' | 'other'>()
    .oneOf(['education', 'amusement', 'work', 'hobby', 'other'])
    .required('Category is required'),
});

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: yupResolver(schema) as any, // cast to avoid complex type issues
    defaultValues: {
      title: initialValues.title || '',
      description: initialValues.description || '',
      date: initialValues.date
        ? new Date(initialValues.date).toISOString().slice(0, 16)
        : '',
      category: initialValues.category || 'education',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          {...register('title')}
          disabled={isSubmitting}
        />
        {errors.title && (
          <span className={styles.error}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          disabled={isSubmitting}
          rows={4}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="date">Date & Time *</label>
        <input
          id="date"
          type="datetime-local"
          {...register('date')}
          disabled={isSubmitting}
        />
        {errors.date && (
          <span className={styles.error}>{errors.date.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="category">Category *</label>
        <select id="category" {...register('category')} disabled={isSubmitting}>
          <option value="education">Education</option>
          <option value="amusement">Amusement</option>
          <option value="work">Work</option>
          <option value="hobby">Hobby</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <span className={styles.error}>{errors.category.message}</span>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
