'use client';

import React from 'react';
import Link from 'next/link';

export function Nav() {
  return (
    <nav style={{
      backgroundColor: '#f8f9fa',
      padding: '1rem 2rem',
      borderBottom: '1px solid #dee2e6'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link href="/" style={{
          textDecoration: 'none',
          color: '#333',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          💬 Chat App
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/create-room" style={{
            textDecoration: 'none',
            color: '#e67e22',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #e67e22'
          }}>
            Create Room
          </Link>
          <Link href="/auth/login" style={{
            textDecoration: 'none',
            color: '#007bff',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}>
            Login
          </Link>
          <Link href="/auth/register" style={{
            textDecoration: 'none',
            color: '#28a745',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}>
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
