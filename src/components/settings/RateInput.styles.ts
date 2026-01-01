import { SxProps, Theme } from '@mui/material';

export const inputStyles: Record<string, SxProps<Theme>> = {
  container: {
    marginBottom: 2,
    width: '100%',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        transition: 'border-color 0.2s ease',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.4)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
        borderWidth: 2,
      },
      '&.Mui-error fieldset': {
        borderColor: 'error.main',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px 14px',
      fontSize: '1rem',
      fontWeight: 500,
      textAlign: 'right',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&[type=number]': {
        MozAppearance: 'textfield',
      },
    },
    '& .MuiInputBase-input:disabled': {
      cursor: 'not-allowed',
      backgroundColor: 'action.disabledBackground',
    },
  },
};

export const errorTextStyles: Record<string, SxProps<Theme>> = {
  error: {
    marginTop: 0.5,
    marginLeft: 1.75,
    fontSize: '0.75rem',
    color: 'error.main',
  },
};
