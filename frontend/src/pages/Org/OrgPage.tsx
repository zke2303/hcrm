import React from 'react';
import OrgManagement from '@/features/sys-org/components/OrgManagement';

const OrgPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">组织架构可视化中心</h1>
        <p className="text-sm text-gray-500 font-medium">Visual Organization & Staff Management</p>
      </div>
      <OrgManagement />
    </div>
  );
};

export default OrgPage;
