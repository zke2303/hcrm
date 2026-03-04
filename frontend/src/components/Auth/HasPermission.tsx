import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface HasPermissionProps {
  permission: string | string[];
  mode?: 'all' | 'any';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 权限控制组件
 */
export const HasPermission: React.FC<HasPermissionProps> = ({ 
  permission, 
  mode = 'any', 
  children, 
  fallback = null 
}) => {
  const userPermissions = useAuthStore(state => state.user?.permissions || []);
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  let hasPermission = false;
  if (mode === 'any') {
    hasPermission = permissions.some(p => userPermissions.includes(p));
  } else {
    hasPermission = permissions.every(p => userPermissions.includes(p));
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
