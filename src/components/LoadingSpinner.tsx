'use client';

import Image from 'next/image';

interface LoadingSpinnerProps {
  isClosing?: boolean;
}

export default function LoadingSpinner({ isClosing = false }: LoadingSpinnerProps) {
  return (
    <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 ${isClosing ? 'animate-fadeOut' : ''}`}>
      <div className="animate-spin-pause">
        <Image
          src="/logo-turbines.png"
          alt="Loading"
          width={80}
          height={80}
          priority
        />
      </div>
    </div>
  );
}
