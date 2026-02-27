import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../Button/Button';
import styles from './UserForm.module.scss';

const schema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'Too short')
    .max(50, 'Too long'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Too short')
    .max(50, 'Too long'),
  patronymic: yup
    .string()
    .required('Patronymic is required')
    .min(2, 'Too short')
    .max(50, 'Too long'),
  gender: yup.string().oneOf(['male', 'female']).required('Gender is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .test('valid-date', 'Invalid date', (value) => !isNaN(Date.parse(value))),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
});

export type UserFormValues = yup.InferType<typeof schema>;

interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: initialValues.firstName || '',
      lastName: initialValues.lastName || '',
      patronymic: initialValues.patronymic || '',
      gender: initialValues.gender || 'male',
      dateOfBirth: initialValues.dateOfBirth || '',
      email: initialValues.email || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="firstName">First Name *</label>
        <input
          id="firstName"
          type="text"
          {...register('firstName')}
          disabled={isSubmitting}
        />
        {errors.firstName && (
          <span className={styles.error}>{errors.firstName.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="lastName">Last Name *</label>
        <input
          id="lastName"
          type="text"
          {...register('lastName')}
          disabled={isSubmitting}
        />
        {errors.lastName && (
          <span className={styles.error}>{errors.lastName.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="patronymic">Patronymic *</label>
        <input
          id="patronymic"
          type="text"
          {...register('patronymic')}
          disabled={isSubmitting}
        />
        {errors.patronymic && (
          <span className={styles.error}>{errors.patronymic.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="gender">Gender *</label>
        <select id="gender" {...register('gender')} disabled={isSubmitting}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender && (
          <span className={styles.error}>{errors.gender.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="dateOfBirth">Date of Birth *</label>
        <input
          id="dateOfBirth"
          type="date"
          {...register('dateOfBirth')}
          disabled={isSubmitting}
        />
        {errors.dateOfBirth && (
          <span className={styles.error}>{errors.dateOfBirth.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className={styles.error}>{errors.email.message}</span>
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

export default UserForm;
