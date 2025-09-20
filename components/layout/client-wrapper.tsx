"use client"

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ToastProvider } from '@radix-ui/react-toast';
import { Toaster } from '@/components/ui/toaster';

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after initial render
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render providers after mounting to avoid hydration issues
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  );
}
