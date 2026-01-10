import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Chip, Box, Typography } from '@mui/material';
import { PagerDutySchedule } from '@/lib/types';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

interface ScheduleMultiSelectProps {
  value: PagerDutySchedule[];
  onChange: (schedules: PagerDutySchedule[]) => void;
  isLoadingInitial?: boolean;
}

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json());

export default function ScheduleMultiSelect({
  value,
  onChange,
  isLoadingInitial,
}: ScheduleMultiSelectProps) {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<PagerDutySchedule[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data, isLoading } = useSWR(
    session?.accessToken && debouncedQuery && open
      ? [`/api/schedules?query=${encodeURIComponent(debouncedQuery)}&limit=20`, session.accessToken]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (data?.schedules) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOptions(() => {
        // Keep existing options if they are selected/valued
        const selectedIds = new Set(value.map((v) => v.id));
        const newOpts = [...value]; // Ensure selected are always in options

        data.schedules.forEach((s: PagerDutySchedule) => {
          if (!selectedIds.has(s.id)) {
            newOpts.push(s);
          }
        });

        // Deduplicate by ID
        const uniqueOpts: PagerDutySchedule[] = [];
        const seenIds = new Set();
        newOpts.forEach((o) => {
          if (!seenIds.has(o.id)) {
            uniqueOpts.push(o);
            seenIds.add(o.id);
          }
        });

        return uniqueOpts;
      });
    }
  }, [data, value]);

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isLoading || isLoadingInitial}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            <Box>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.id} • {option.time_zone}
              </Typography>
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Schedules"
          placeholder="Select schedules..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading || isLoadingInitial ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} label={option.name} {...tagProps} />;
        })
      }
    />
  );
}
