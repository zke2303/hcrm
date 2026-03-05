import React, { useState } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import OrgTree from './OrgTree';
import GroupedStaffList from './GroupedStaffList';

const OrgManagement: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>();

  return (
    <div className="h-[calc(100vh-120px)] w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <PanelGroup orientation="horizontal">
        <Panel defaultSize={25} minSize={20} className="bg-gray-50/30">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-gray-900">组织架构</h3>
              <p className="text-xs text-gray-400 mt-1">管理科室归属与人员分配</p>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <OrgTree 
                selectedId={selectedDeptId} 
                onSelect={(id: number) => setSelectedDeptId(id)} 
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-100 hover:bg-blue-200 transition-colors cursor-col-resize" />

        <Panel defaultSize={75}>
          <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-auto">
              <GroupedStaffList deptId={selectedDeptId} />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default OrgManagement;
