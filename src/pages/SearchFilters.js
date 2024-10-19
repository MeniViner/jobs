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
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  DialogActions, // ייבוא DialogActions
} from '@mui/material';

export default function SearchFilters({
  filter,
  setFilter,
  locationFilter,
  setLocationFilter,
  categoryFilter,
  setCategoryFilter,
  salaryFilter,
  setSalaryFilter, // הוספת setSalaryFilter כפרופ חדש
  experienceFilter,
  setExperienceFilter,
  jobTypeFilter,
  setJobTypeFilter,
  showFilters,
  setShowFilters,
  handleFilterChange,
  activeFilters,
  setActiveFilters,
  removeFilter,
  filteredJobsCount,
}) {
  // הגדרות האנימציה
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: '100vh', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { y: '100vh', opacity: 0, transition: { ease: 'easeInOut' } },
  };

  // פונקציה לסגירת הסינון כאשר לוחצים על backdrop
  const handleBackdropClick = () => {
    setShowFilters(false);
  };

  // פונקציה למניעת סגירה כאשר לוחצים בתוך המודאל
  const handleModalClick = (e) => {
    e.stopPropagation();
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
          <TextField
            variant="standard"
            placeholder="חפש משרות"
            value={filter}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: <Search color="#829AB1" />,
            }}
            fullWidth
          />
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
            justifyContent: 'center',
          }}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal />
        </Box>
      </Box>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleBackdropClick} // סגירת הסינון בלחיצה על ה-backdrop
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1300, // גבוה ממסגרת Material-UI Dialog
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end', // ההתאמה למכשירים ניידים
            }}
          >
            <motion.div
              className="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleModalClick} // מניעת סגירה בלחיצה בתוך המודאל
              style={{
                background: '#fff',
                width: '100%',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative', // כדי לאפשר מיקום אבסולוטי של הכפתור
              }}
            >
              {/* כותרת עם כפתור הסגירה */}
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  background: '#fff',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid #E4E7EB',
                }}
              >
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  מסננים
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setShowFilters(false)}
                  aria-label="close"
                >
                  <X />
                </IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* סינון קטגוריה */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  קטגוריה
                </Typography>
                <ToggleButtonGroup
                  value={categoryFilter}
                  exclusive
                  onChange={(e, value) => handleFilterChange('category', value)}
                  aria-label="job category"
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
                  <ToggleButton
                    value="contract"
                    aria-label="contract"
                    sx={{
                      flex: 1,
                      borderRadius: '100px',
                      ml: 1,
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
                    חוזה
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* סינון שכר */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  טווח שכר (₪)
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={salaryFilter}
                    onChange={(e, newValue) => setSalaryFilter(newValue)} // עדכון מיידי של השכר
                    valueLabelDisplay="auto"
                    min={20}
                    max={500}
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
                      {salaryFilter[1] === 500 ? `₪ ${salaryFilter[1]} ומעלה` : `₪ ${salaryFilter[1]}`}
                    </Typography>
                  </Box>
                </Box>

                {/* סינון רמת ניסיון */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                  רמת ניסיון
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="experience-label">בחר רמת ניסיון</InputLabel>
                  <Select
                    labelId="experience-label"
                    id="experience"
                    value={experienceFilter}
                    label="בחר רמת ניסיון"
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <MenuItem value=""><em>כל הרמות</em></MenuItem>
                    <MenuItem value="entry">חדשים</MenuItem>
                    <MenuItem value="mid">בינוניים</MenuItem>
                    <MenuItem value="senior">בכירים</MenuItem>
                  </Select>
                </FormControl>

                {/* סינון סוג עבודה */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                  סוג עבודה
                </Typography>
                <ToggleButtonGroup
                  value={jobTypeFilter}
                  exclusive
                  onChange={(e, value) => handleFilterChange('jobType', value)}
                  aria-label="job type"
                  sx={{ mb: 3, width: '100%' }}
                >
                  <ToggleButton
                    value="remote"
                    aria-label="remote"
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
                    מרחוק
                  </ToggleButton>
                  <ToggleButton
                    value="onsite"
                    aria-label="onsite"
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
                    במשרד
                  </ToggleButton>
                  <ToggleButton
                    value="hybrid"
                    aria-label="hybrid"
                    sx={{
                      flex: 1,
                      borderRadius: '100px',
                      ml: 1,
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
                    היברידי
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* סינון מיקום */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                  מיקום
                </Typography>
                <TextField
                  variant="outlined"
                  placeholder="הזן מיקום"
                  value={locationFilter}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  fullWidth
                  sx={{ mb: 3 }}
                />

                {/* סינון תפקיד */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                  תפקיד
                </Typography>
                <TextField
                  variant="outlined"
                  placeholder="הזן תפקיד"
                  value={filter}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  fullWidth
                  sx={{ mb: 3 }}
                />
              </Box>

              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                  onClick={() => {
                    setCategoryFilter('');
                    setSalaryFilter([20, 500]);
                    setLocationFilter('');
                    setExperienceFilter('');
                    setJobTypeFilter('');
                    setFilter('');
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
                    bgcolor: '#0077B6',
                    '&:hover': {
                      bgcolor: '#005f8d',
                    },
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                  }}
                >
                  הצג {filteredJobsCount} משרות
                </Button>
              </DialogActions>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
