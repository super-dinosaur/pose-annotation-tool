/**
 * Loading overlay component
 */

import React from 'react';
import { Spin } from 'antd';
import './LoadingOverlay.css';

/**
 * LoadingOverlay component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @returns {JSX.Element}
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spin size="large" />
        <div className="loading-message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
