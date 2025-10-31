'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function RingCentralPhone() {
  useEffect(() => {
    // Configure RingCentral Embeddable when it loads
    const handleRCLoaded = () => {
      if (window.RCAdapter) {
        console.log('✅ RingCentral Embeddable loaded');
      }
    };

    // Listen for RC ready event
    window.addEventListener('rc-adapter-ready', handleRCLoaded);

    return () => {
      window.removeEventListener('rc-adapter-ready', handleRCLoaded);
    };
  }, []);

  return (
    <>
      <Script
        src="https://apps.ringcentral.com/integration/ringcentral-embeddable/2.x/adapter.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('RingCentral script loaded');
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    RCAdapter: any;
  }
}
