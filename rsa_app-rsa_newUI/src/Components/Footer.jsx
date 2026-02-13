import React from 'react';
import { FaRegCopyright } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        position: 'fixed',           // ← key change
        bottom: 0,                   // ← key change
        left: 0,
        right: 0,                    // ← key change
        zIndex: 1000,                // optional: make sure it's above other content

        color: '#095399',
        fontSize: '13px',
        padding: '2px 8px 3px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',

        // Optional: subtle shadow to make it feel "above" content
        boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ color: 'rgba(48, 107, 255, 1)' }}>
        Version <strong>1.0.0.35</strong>
      </div>

      <a
        href="https://rbg.iitm.ac.in"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'rgba(48, 107, 255, 1)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
        }}
      >
        Designed & Developed by RBG Labs, IIT Madras
        <FaRegCopyright size={13} />
        {currentYear}
      </a>
    </footer>
  );
}