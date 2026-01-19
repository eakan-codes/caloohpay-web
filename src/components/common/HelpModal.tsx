/**
 * Help Modal Component
 * Displays information about how to read and interpret visualizations
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Help, Close } from '@mui/icons-material';

interface HelpModalProps {
  title: string;
  description: string | React.ReactNode;
  howToRead?: string | React.ReactNode;
  value?: string | React.ReactNode;
  iconButtonSx?: object;
}

export function HelpModal({ title, description, howToRead, value, iconButtonSx }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        aria-label={`Help for ${title}`}
        sx={{
          ml: 1,
          opacity: 0.7,
          '&:hover': { opacity: 1 },
          ...iconButtonSx,
        }}
      >
        <Help fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleClose} size="small" aria-label="Close">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            {typeof description === 'string' ? (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            ) : (
              description
            )}
          </Box>

          {howToRead && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                How to Read
              </Typography>
              {typeof howToRead === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {howToRead}
                </Typography>
              ) : (
                howToRead
              )}
            </Box>
          )}

          {value && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Value & Insights
              </Typography>
              {typeof value === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {value}
                </Typography>
              ) : (
                value
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
