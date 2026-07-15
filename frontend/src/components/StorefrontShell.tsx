import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { StorefrontTenantProvider, useStorefront } from '../context/TenantContext';

const StorefrontGate: React.FC = () => {
  const { loading, error, path, tenant } = useStorefront();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#a9b8c3]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper" />
        <p className="text-xs uppercase tracking-widest">Opening restaurant…</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 text-sm">{error || 'Restaurant not found'}</p>
        <Link to="/" className="text-xs uppercase tracking-widest text-tastyc-copper border border-tastyc-copper/30 px-4 py-2">
          Back to directory
        </Link>
        <p className="text-[10px] text-[#a9b8c3]">
          Tried path <span className="font-mono text-white">{path()}</span>
        </p>
      </div>
    );
  }

  return <Outlet />;
};

/** Resolves /r/:slug then renders nested customer routes. */
export const StorefrontShell: React.FC = () => (
  <StorefrontTenantProvider>
    <StorefrontGate />
  </StorefrontTenantProvider>
);
