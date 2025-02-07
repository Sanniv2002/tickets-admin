import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { whoami } from '../services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await whoami();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/mgmt" replace />;
};

export default ProtectedRoute;