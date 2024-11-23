import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Calendar, 
  Users,
  Building2
} from 'lucide-react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link } from 'react-router-dom';
import styles from './JobListPageStyles';

const JobCard = memo(function JobCard({ 
  job, 
  expandedJob, 
  setExpandedJob, 
  handleSaveJob, 
  savedJobs, 
  acceptedJobs, 
  appliedJobs, 
  handleApplyForJob 
}) {
  const getTagStyle = (type) => {
    const baseStyle = { ...styles.tag };
    switch(type) {
      case 'location':
        return { ...baseStyle, background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' };
      case 'type':
        return { ...baseStyle, background: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.12)' };
      case 'experience':
        return { ...baseStyle, background: 'rgba(239, 68, 68, 0.08)', color: '#DC2626', border: '1px solid rgba(239, 68, 68, 0.12)' };
      case 'jobType':
        return { ...baseStyle, background: 'rgba(245, 158, 11, 0.08)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.12)' };
      case 'car':
        return { ...baseStyle, background: 'rgba(217, 119, 6, 0.08)', color: '#B45309', border: '1px solid rgba(217, 119, 6, 0.12)' };
      case 'flexible':
        return { ...baseStyle, background: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.12)' };
      case 'accepted':
        return { ...baseStyle, background: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.12)' };
      default:
        return baseStyle;
    }
  };

  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={styles.jobCard}
    >
      <div style={styles.jobHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={styles.jobTitle}>{job.title}</h2>
          <button
            onClick={() => handleSaveJob(job.id)}
            style={styles.bookmarkButton}
            aria-label={savedJobs.includes(job.id) ? 'הסר משרה מהשמורים' : 'שמור משרה'}
          >
            <Bookmark
              size={18}
              color={savedJobs.includes(job.id) ? '#3B82F6' : '#6B7280'}
              fill={savedJobs.includes(job.id) ? '#3B82F6' : 'none'}
            />
          </button>
        </div>

        <p style={styles.jobCompany}>
          <Briefcase size={16} style={{ marginLeft: '8px', color: '#3B82F6' }} />
          {job.companyName || 'שם החברה לא זמין'}
        </p>

        <div style={styles.jobTags}>
          <span style={getTagStyle('location')}>
            <MapPin size={14} />
            {job.location}
          </span>
          <span style={getTagStyle('type')}>
            <Clock size={14} />
            {job.type}
          </span>
          {job.experience && (
            <span style={getTagStyle('experience')}>
              ניסיון: {job.experience}
            </span>
          )}
          {job.jobType && (
            <span style={getTagStyle('jobType')}>
              סוג עבודה: {job.jobType}
            </span>
          )}
          {job.requiresCar && (
            <span style={getTagStyle('car')}>
              <DirectionsCarIcon style={{ fontSize: '16px' }} />
              דרוש רכב
            </span>
          )}
          {job.isFlexibleTime && (
            <span style={getTagStyle('flexible')}>
              <Clock size={14} />
              שעות גמישות
            </span>
          )}
          {job.isFlexibleDates && (
            <span style={getTagStyle('flexible')}>
              <Calendar size={14} />
              תאריכים גמישים
            </span>
          )}
          {acceptedJobs.includes(job.id) && (
            <span style={getTagStyle('accepted')}>
              <CheckCircle size={14} />
              התקבלתי
            </span>
          )}
        </div>

        <p style={styles.jobDescription}>{job.description}</p>
        
        <div style={styles.jobDetails}>
          <div style={styles.jobDetailItem}>
            <span style={{ color: '#3B82F6' }}>₪</span>
            <span>{job.salary} לשעה</span>
          </div>
          <div style={styles.jobDetailItem}>
            <Users size={16} style={{ color: '#3B82F6' }} />
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
            style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <p style={{
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: '#111827',
                  fontSize: '0.9375rem'
                }}>
                  שעות עבודה:
                </p>
                {job.isFlexibleTime ? (
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>שעות גמישות</p>
                ) : Array.isArray(job.workHours) ? (
                  job.workHours.map((time, index) => (
                    <p key={index} style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                      {time}
                    </p>
                  ))
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {job.startTime} - {job.endTime}
                  </p>
                )}
              </div>
              <div>
                <p style={{
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: '#111827',
                  fontSize: '0.9375rem'
                }}>
                  תאריכי עבודה:
                </p>
                {job.isFlexibleDates ? (
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>תאריכים גמישים</p>
                ) : Array.isArray(job.workDates) ? (
                  job.workDates.map((date, index) => (
                    <p key={index} style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                      {date}
                    </p>
                  ))
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{job.workDates}</p>
                )}
              </div>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              lineHeight: '1.6',
              background: 'rgba(59, 130, 246, 0.04)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.08)'
            }}>
              {job.fullDescription ||
                'תיאור מלא של המשרה לא זמין כרגע. אנא צור קשר עם המעסיק לקבלת מידע נוסף.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.jobFooter}>
        <Link to={`/user/${job.employerId}`} style={styles.employerLink}>
          {/* <span style={styles.employerIcon}>
            <Building2 size={16} color="#3B82F6" />
          </span> */}
          פרטי מעסיק
        </Link>
        
        <button
          style={styles.expandButton}
          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
          aria-expanded={expandedJob === job.id}
          aria-controls={`job-details-${job.id}`}
        >
          {expandedJob === job.id ? (
            <>
              <span>הסתר פרטים</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>הצג פרטים</span>
              <ChevronDown size={16} />
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
            if (!acceptedJobs.includes(job.id)) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!acceptedJobs.includes(job.id)) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
            }
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
            : 'הגש מועמדות'}
        </button>
      </div>
    </motion.div>
  );
});

export default JobCard;