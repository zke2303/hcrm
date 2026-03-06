import React, { useState } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import { Plus, Users, LayoutGrid } from 'lucide-react';
import OrgTree from './OrgTree';
import GroupedStaffList from './GroupedStaffList';

const OrgManagement: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>();

  return (
    <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-120px)]">
      {/* Standard Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">组织架构管理</h1>
          <p className="text-sm text-gray-500 mt-1">维护医院组织树、科室设置及各科室人员归属分配</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <LayoutGrid size={16} />
            批量调整
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <Plus size={16} />
            新增科室
          </button>
        </div>
      </div>

      {/* Main Content Area with Split Panels */}
      <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={25} minSize={20} className="bg-gray-50/30">
            <div className="h-full flex flex-col">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Users size={16} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">组织树</h3>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <OrgTree 
                  selectedId={selectedDeptId} 
                  onSelect={(id: number) => setSelectedDeptId(id)} 
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-100 hover:bg-blue-200 transition-colors cursor-col-resize" />

          <Panel defaultSize={75}>
            <div className="h-full flex flex-col bg-white overflow-hidden">
               <GroupedStaffList deptId={selectedDeptId} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default OrgManagement;
