const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FAFBFF 0%, #F3F4F6 100%)',
    padding: '32px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  activeFiltersContainer: {
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    padding: '0.75rem 0',
    marginTop: '1rem',
    gap: '0.75rem',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none'
    }
  },
  activeFilter: {
    background: 'rgba(59, 130, 246, 0.08)',
    color: '#3B82F6',
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    backdropFilter: 'blur(8px)',
  },
  removeFilterButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '4px',
    color: '#3B82F6',
    padding: '2px',
  },
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  jobCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
    }
  },
  jobHeader: {
    padding: '24px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  jobTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    lineHeight: '1.4',
    letterSpacing: '-0.01em'
  },
  bookmarkButton: {
    background: 'rgba(59, 130, 246, 0.04)',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.08)',
      transform: 'scale(1.05)'
    }
  },
  jobCompany: {
    display: 'flex',
    alignItems: 'center',
    color: '#4B5563',
    fontSize: '0.9375rem',
    marginBottom: '20px',
    fontWeight: '500'
  },
  jobTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.625rem',
    marginBottom: '1.25rem',
  },
  tag: {
    background: 'rgba(59, 130, 246, 0.08)',
    color: '#3B82F6',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid rgba(59, 130, 246, 0.12)',
  },
  jobDescription: {
    color: '#6B7280',
    marginBottom: '1.25rem',
    lineHeight: '1.6',
    fontSize: '0.9375rem',
  },
  jobDetails: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  jobDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '12px',
    background: 'rgba(59, 130, 246, 0.04)',
    color: '#111827',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.08)',
    }
  },
  jobFooter: {
    background: '#F9FAFB',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  employerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4B5563',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.875rem',
    padding: '8px 16px',
    borderRadius: '12px',
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#F3F4F6',
      color: '#111827',
    }
  },
  employerIcon: {
    padding: '6px',
    background: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '0.875rem',
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
    }
  },
  expandButton: {
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#4B5563',
    fontWeight: '500',
    fontSize: '0.875rem',
    padding: '8px 16px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#F3F4F6',
      color: '#111827',
    }
  },
};

export default styles;