import React, { useState } from 'react';
import { User, Mail, Phone, BadgeCheck, Stethoscope, Loader2, Hospital, Search, RotateCcw } from 'lucide-react';
import { useStaffList } from '../hooks/useOrg';
import UserDialog from '../../sys-user/components/UserDialog';
import type { UserVO } from '../types';

interface GroupedStaffListProps {
  deptId?: number;
}

const GroupedStaffList: React.FC<GroupedStaffListProps> = ({ deptId }) => {
  const { data: groups, isLoading } = useStaffList(deptId);
  const [keyword, setKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserVO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReset = () => {
    setKeyword('');
  };

  const handleCardClick = (staff: UserVO) => {
    setSelectedUser(staff);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="text-sm text-gray-400 font-bold">正在索引科室人员数据...</span>
      </div>
    );
  }

  const filteredGroups = groups?.map(group => ({
    ...group,
    staff: group.staff.filter(s => 
        s.realName.includes(keyword) || 
        s.phone.includes(keyword) || 
        (s.employeeNo && s.employeeNo.includes(keyword))
    )
  })).filter(group => group.staff.length > 0) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50/50 p-6 border-b border-gray-100 shadow-sm">
        <form className="flex flex-wrap items-end gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">人员快速检索</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="搜索姓名、工号、手机号..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              <Search size={16} />
              查询
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={16} />
              重置
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-10 bg-white">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Hospital size={64} className="text-gray-200" />
            <p className="mt-4 text-gray-400 font-bold">暂无匹配的医生人员数据</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.departmentId} className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-blue-50 pb-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-black text-gray-900">{group.departmentName}</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">
                  {group.staff.length} PERSONS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {group.staff.map((staff) => (
                  <div 
                    key={staff.id} 
                    onClick={() => handleCardClick(staff)}
                    className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <User size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{staff.realName}</h4>
                          {staff.isDoctor && (
                            <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black tracking-tighter uppercase border border-emerald-100">
                              DOCTOR
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-blue-600 font-bold text-xs">
                          <Stethoscope size={12} />
                          <span>{staff.title || '专科医生'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <Phone size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate">{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <Mail size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate">{staff.email || '未完善个人主页'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                        <BadgeCheck size={12} className="text-emerald-500" />
                        账号已启用
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        点击管理档案
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <UserDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={selectedUser as any}
        hideAccountSection={true}
      />
    </div>
  );
};

export default GroupedStaffList;
