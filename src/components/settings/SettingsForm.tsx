import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, CircularProgress } from '@mui/material';
import { RateInput } from './RateInput';
import { PAYMENT_RATES } from '@/lib/constants';
import { RATE_VALIDATION } from '@/lib/utils/ratesUtils';
import * as styles from './SettingsForm.styles';

// Zod validation schema - uses centralized validation constants
const settingsFormSchema = z.object({
  weekdayRate: z
    .number()
    .min(
      RATE_VALIDATION.MIN,
      `Rate must be between ${RATE_VALIDATION.MIN} and ${RATE_VALIDATION.MAX}`
    )
    .max(
      RATE_VALIDATION.MAX,
      `Rate must be between ${RATE_VALIDATION.MIN} and ${RATE_VALIDATION.MAX}`
    ),
  weekendRate: z
    .number()
    .min(
      RATE_VALIDATION.MIN,
      `Rate must be between ${RATE_VALIDATION.MIN} and ${RATE_VALIDATION.MAX}`
    )
    .max(
      RATE_VALIDATION.MAX,
      `Rate must be between ${RATE_VALIDATION.MIN} and ${RATE_VALIDATION.MAX}`
    ),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;

export interface SettingsFormProps {
  initialValues: SettingsFormData;
  onSubmit: (data: SettingsFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const SettingsForm = React.memo(
  ({ initialValues, onSubmit, isLoading = false }: SettingsFormProps) => {
    const {
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
    } = useForm<SettingsFormData>({
      resolver: zodResolver(settingsFormSchema),
      defaultValues: initialValues,
      mode: 'onBlur',
    });

    const weekdayRate = watch('weekdayRate');
    const weekendRate = watch('weekendRate');

    const handleWeekdayChange = useCallback(
      (value: number | '') => {
        // Allow empty value to trigger validation - convert to 0 which will fail min validation
        setValue('weekdayRate', value === '' ? 0 : value, { shouldValidate: true });
      },
      [setValue]
    );

    const handleWeekendChange = useCallback(
      (value: number | '') => {
        // Allow empty value to trigger validation - convert to 0 which will fail min validation
        setValue('weekendRate', value === '' ? 0 : value, { shouldValidate: true });
      },
      [setValue]
    );

    const handleReset = useCallback(() => {
      setValue('weekdayRate', PAYMENT_RATES.WEEKDAY);
      setValue('weekendRate', PAYMENT_RATES.WEEKEND);
    }, [setValue]);

    const handleCancel = useCallback(() => {
      setValue('weekdayRate', initialValues.weekdayRate);
      setValue('weekendRate', initialValues.weekendRate);
    }, [setValue, initialValues]);

    return (
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.formStyles}>
        <Box sx={styles.fieldsContainerStyles}>
          <RateInput
            label="Weekday Rate (£)"
            value={weekdayRate}
            onChange={handleWeekdayChange}
            error={errors.weekdayRate?.message}
            disabled={isLoading}
            min={25}
            max={200}
          />
          <RateInput
            label="Weekend Rate (£)"
            value={weekendRate}
            onChange={handleWeekendChange}
            error={errors.weekendRate?.message}
            disabled={isLoading}
            min={25}
            max={200}
          />
        </Box>

        <Box sx={styles.buttonsContainerStyles}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={handleReset}
            disabled={isLoading}
            sx={styles.resetButtonStyles}
          >
            Restore Defaults
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={styles.submitButtonStyles}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading}
            sx={styles.cancelButtonStyles}
          >
            Cancel
          </Button>
        </Box>

        {isLoading && (
          <Box sx={styles.loadingSpinnerStyles}>
            <CircularProgress size={24} role="progressbar" />
          </Box>
        )}
      </Box>
    );
  }
);

SettingsForm.displayName = 'SettingsForm';
