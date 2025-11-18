'use client';

import React from 'react';

export function Init() {
  React.useEffect(() => {
    // Initialization logic will go here
    console.log('App initialized');
  }, []);

  return null; // This component doesn't render anything
}
