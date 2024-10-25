import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Briefcase, MapPin, Clock, ChevronDown, ChevronUp, CheckCircle, Calendar, Users, } from 'lucide-react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link } from 'react-router-dom';
import styles from './JobListPageStyles';

const JobCard = memo(function JobCard({ 
      job, expandedJob, setExpandedJob, handleSaveJob, savedJobs, acceptedJobs, appliedJobs, handleApplyForJob 
}) {
  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={styles.jobCard}
    >

        <div style={styles.jobHeader}>
            <div
                style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
                }}
            >
                <h2 style={styles.jobTitle}>{job.title}</h2>
                <button
                    onClick={() => handleSaveJob(job.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label={savedJobs.includes(job.id) ? 'הסר משרה מהשמורים' : 'שמור משרה'}
                >
                    <Bookmark
                    color={savedJobs.includes(job.id) ? '#0077B6' : '#829AB1'}
                    fill={savedJobs.includes(job.id) ? '#0077B6' : 'none'}
                    />
                </button>
            </div>

            <p style={styles.jobCompany}>
                <Briefcase size={16} style={{ marginLeft: '8px' }} />
                {job.companyName || 'שם החברה לא זמין'}
            </p>
            <div style={styles.jobTags}>
                <span style={styles.tag}>
                    <MapPin size={14} style={{ marginLeft: '4px' }} />
                    {job.location}
                </span>
                <span style={{ ...styles.tag, background: '#E0FFF4', color: '#047857' }}>
                    <Clock size={14} style={{ marginLeft: '4px' }} />
                    {job.type}
                </span>
                {job.experience && (
                    <span style={{ ...styles.tag, background: '#FFF0F0', color: '#D00000' }}>
                        ניסיון: {job.experience}
                    </span>
                )}
                {job.jobType && (
                    <span style={{ ...styles.tag, background: '#F0E68C', color: '#DAA520' }}>
                        סוג עבודה: {job.jobType}
                    </span>
                )}
                {job.requiresCar && (
                    <span style={{ ...styles.tag, background: '#FFEDCC', color: '#D2691E' }}>
                        <DirectionsCarIcon style={{ fontSize: '18px', marginLeft: '4px' }}/>
                        דרוש רכב
                    </span>
                )}
                {job.isFlexibleTime && (
                    <span style={{ ...styles.tag, background: '#E0FFE0', color: '#008000' }}>
                        <Clock size={14} style={{ marginLeft: '4px' }} />
                        שעות גמישות
                    </span>
                )}
                {job.isFlexibleDates && (
                    <span style={{ ...styles.tag, background: '#E0FFE0', color: '#008000' }}>
                        <Calendar size={14} style={{ marginLeft: '4px' }} />
                        תאריכים גמישים
                    </span>
                )}
                {acceptedJobs.includes(job.id) && (
                    <span style={{ ...styles.tag, background: '#D1FAE5', color: '#065F46' }}>
                        <CheckCircle size={14} style={{ marginLeft: '4px' }} />
                        התקבלתי
                    </span>
                )}
            </div>

            <p style={styles.jobDescription}>{job.description}</p>
            <div style={styles.jobDetails}>
                <div style={styles.jobDetailItem}>
                    <span>₪{job.salary} לשעה</span>
                </div>
                <div style={styles.jobDetailItem}>
                    <Users size={20} color="#0077B6" style={{ marginLeft: '8px' }} />
                    <span>{job.workersNeeded || 1} עובדים</span>
                </div>
            </div>
        </div>

        <AnimatePresence>
            {expandedJob === job.id && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '16px 24px', borderTop: '1px solid #E4E7EB' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <p
                        style={{
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#102A43',
                        }}
                        >
                        שעות עבודה:
                        </p>
                        {job.isFlexibleTime ? (
                        <p style={{ fontSize: '0.875rem', color: '#486581' }}>שעות גמישות</p>
                        ) : Array.isArray(job.workHours) ? (
                        job.workHours.map((time, index) => (
                            <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>
                            {time}
                            </p>
                        ))
                        ) : (
                        <p style={{ fontSize: '0.875rem', color: '#486581' }}>
                            {job.startTime} - {job.endTime}
                        </p>
                        )}
                    </div>
                    <div>
                        <p
                        style={{
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#102A43',
                        }}
                        >
                        תאריכי עבודה:
                        </p>
                        {job.isFlexibleDates ? (
                        <p style={{ fontSize: '0.875rem', color: '#486581' }}>תאריכים גמישים</p>
                        ) : Array.isArray(job.workDates) ? (
                        job.workDates.map((date, index) => (
                            <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>
                            {date}
                            </p>
                        ))
                        ) : (
                        <p style={{ fontSize: '0.875rem', color: '#486581' }}>{job.workDates}</p>
                        )}
                    </div>
                </div>
                <p
                    style={{
                        fontSize: '0.875rem',
                        color: '#486581',
                        lineHeight: '1.6',
                    }}
                >
                {job.fullDescription ||
                    'תיאור מלא של המשרה לא זמין כרגע. אנא צור קשר עם המעסיק לקבלת מידע נוסף.'}
                </p>
            </motion.div>
            )}
        </AnimatePresence>

        <div style={styles.jobFooter}>
            <Link to={`/user/${job.employerId}`} style={styles.link}>
                צפיה בפרטי מעסיק
            </Link>
            <button
                style={styles.expandButton}
                onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                aria-expanded={expandedJob === job.id}
                aria-controls={`job-details-${job.id}`}
            >
                {expandedJob === job.id ? (
                    <>
                        <span style={{ marginLeft: '2px' }}>הסתר פרטים</span>
                        <ChevronUp size={20} style={{ marginLeft: '17px' }} />
                    </>
                ) : (
                    <>
                        <span style={{ marginLeft: '2px' }}>הצג פרטים</span>
                        <ChevronDown size={20} style={{ marginLeft: '17px' }} />
                    </>
                )}
            </button>
            <button
                style={{
                    ...styles.applyButton,
                    background: acceptedJobs.includes(job.id)
                    ? '#4CAF50'
                    : appliedJobs.includes(job.id)
                    ? '#99AFA3'
                    : 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
                    opacity: acceptedJobs.includes(job.id) ? 0.6 : 1,
                    cursor: acceptedJobs.includes(job.id) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                    if (!acceptedJobs.includes(job.id)) e.currentTarget.style.opacity = 0.8;
                }}
                onMouseLeave={(e) => {
                    if (!acceptedJobs.includes(job.id)) e.currentTarget.style.opacity = 1;
                }}
                onClick={() => {
                    if (!acceptedJobs.includes(job.id)) handleApplyForJob(job.id);
                }}
                disabled={acceptedJobs.includes(job.id)}
            >
                {acceptedJobs.includes(job.id)
                    ? 'התקבלתי למשרה'
                    : appliedJobs.includes(job.id)
                    ? 'בטל מועמדות'
                    : 'הגש מועמדות'
                }
            </button>
        </div>
    </motion.div>
  );
});

export default JobCard;