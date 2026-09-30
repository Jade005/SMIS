import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AnalyticsPage
 * Redirects to the unified Reports & Analytics page (/admin/reports).
 */
const AnalyticsPage = () => {
  return <Navigate to="/admin/reports" replace />;
};

export default AnalyticsPage;
