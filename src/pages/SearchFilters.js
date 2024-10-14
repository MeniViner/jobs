// SearchFilters.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Dialog,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

export default function SearchFilters({
  filter,
  setFilter,
  locationFilter,
  setLocationFilter,
  categoryFilter,
  setCategoryFilter,
  salaryFilter,
  setSalaryFilter,
  showFilters,
  setShowFilters,
  handleFilterChange,
  activeFilters,
  setActiveFilters,
  removeFilter,
  filteredJobsCount,
}) {
  const styles = {
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E4E7EB',
      borderRadius: '8px',
      fontSize: '1rem',
      textAlign: 'right',
      transition: 'all 0.3s',
    },
    // שאר הסגנונות...
  };

  return (
    <>
      <Box sx={{ width: '100%', mb: 2, display: 'flex', gap: '2%' }}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            p: 2,
            width: '80%',
            borderRadius: '100px',
            border: '1px solid #e0e0e0',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
        >
          <Typography sx={{ flexGrow: 1, textAlign: 'right' }}>מיקום? · קטגוריה · סכום</Typography>
          <IconButton size="small" sx={{ ml: 1 }}>
            <Search />
          </IconButton>
        </Box>
        <Box
          sx={{
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            p: 2,
            width: '15%',
            borderRadius: '100px',
            border: '1px solid #e0e0e0',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal sx={{ mr: 1 }} />
        </Box>

        <Dialog
          open={showFilters}
          onClose={() => setShowFilters(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              m: 0,
              width: '100%',
              maxHeight: '100%',
            },
          }}
        >
          <DialogContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                מסננים
              </Typography>
              <IconButton edge="end" color="inherit" onClick={() => setShowFilters(false)} aria-label="close">
                <X />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              סוג משרה
            </Typography>
            <ToggleButtonGroup
              value={categoryFilter}
              exclusive
              onChange={(e, value) => handleFilterChange('category', value)}
              aria-label="job type"
              sx={{ mb: 3, width: '100%' }}
            >
              <ToggleButton
                value="fullTime"
                aria-label="full time"
                sx={{
                  flex: 1,
                  borderRadius: '100px',
                  mr: 1,
                  border: '1px solid #e0e0e0',
                  '&.Mui-selected': {
                    bgcolor: '#E0F2FE',
                    color: '#0077B6',
                    '&:hover': {
                      bgcolor: '#E0F2FE',
                    },
                  },
                }}
              >
                משרה מלאה
              </ToggleButton>
              <ToggleButton
                value="partTime"
                aria-label="part time"
                sx={{
                  flex: 1,
                  borderRadius: '100px',
                  border: '1px solid #e0e0e0',
                  '&.Mui-selected': {
                    bgcolor: '#E0F2FE',
                    color: '#0077B6',
                    '&:hover': {
                      bgcolor: '#E0F2FE',
                    },
                  },
                }}
              >
                משרה חלקית
              </ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              טווח מחירים
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                מינימום
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מקסימום
              </Typography>
            </Box>
            <Slider
              value={salaryFilter}
              onChange={(e, newValue) => handleFilterChange('salary', newValue)}
              valueLabelDisplay="auto"
              min={40}
              max={3400}
              step={10}
              sx={{
                '& .MuiSlider-thumb': {
                  height: 24,
                  width: 24,
                  backgroundColor: '#fff',
                  border: '2px solid currentColor',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.5,
                  backgroundColor: '#bfbfbf',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ₪ {salaryFilter[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {salaryFilter[1] === 3400 ? `₪ ${salaryFilter[1]} ומעלה` : `₪ ${salaryFilter[1]}`}
              </Typography>
            </Box>
          </DialogContent>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="title"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#486581',
                      }}
                    >
                      תפקיד
                    </label>
                    <input
                      type="text"
                      id="title"
                      style={styles.input}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="הזן תפקיד"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#486581',
                      }}
                    >
                      מיקום
                    </label>
                    <input
                      type="text"
                      id="location"
                      style={styles.input}
                      value={locationFilter}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="הזן מיקום"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => {
                setCategoryFilter('');
                setSalaryFilter([40, 3400]);
                setLocationFilter('');
                setActiveFilters([]);
              }}
              sx={{
                color: 'text.primary',
                bgcolor: '#F3F4F6',
                '&:hover': {
                  bgcolor: '#E5E7EB',
                },
                borderRadius: '8px',
                px: 3,
                py: 1,
              }}
            >
              לנקות הכל
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              sx={{
                color: 'white',
                bgcolor: 'black',
                '&:hover': {
                  bgcolor: '#333',
                },
                borderRadius: '8px',
                px: 3,
                py: 1,
              }}
            >
              הצגת {filteredJobsCount} משרות
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
