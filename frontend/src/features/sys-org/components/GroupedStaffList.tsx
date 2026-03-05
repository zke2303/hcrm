import React from 'react';
import { User, Mail, Phone, BadgeCheck, Stethoscope, Loader2, Hospital } from 'lucide-react';
import { useStaffList } from '../hooks/useOrg';

interface GroupedStaffListProps {
  deptId?: number;
}

const GroupedStaffList: React.FC<GroupedStaffListProps> = ({ deptId }) => {
  const { data: groups, isLoading } = useStaffList(deptId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-sm text-gray-400 font-bold">正在索引科室人员数据...</span>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-40">
        <Hospital size={64} className="text-gray-200" />
        <p className="mt-4 text-gray-400 font-bold">该节点下暂无医生档案</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {groups.map((group) => (
        <div key={group.departmentId} className="space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-blue-50 pb-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-lg font-black text-gray-900">{group.departmentName}</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">
              {group.staff.length} 人
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.staff.map((staff) => (
              <div 
                key={staff.id} 
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <User size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-gray-900 truncate">{staff.realName}</h4>
                      {staff.isDoctor && (
                        <div className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-black tracking-tighter uppercase">
                          DOCTOR
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-blue-600 font-bold text-xs">
                      <Stethoscope size={12} />
                      <span>{staff.title || '普通医生'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <Phone size={12} className="shrink-0" />
                    <span className="truncate">{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium italic">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{staff.email || '未完善邮箱'}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                   <div className="p-1 px-2 bg-gray-50 text-gray-400 rounded-lg text-xs font-mono font-bold">
                      #{staff.employeeNo}
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                      <BadgeCheck size={12} className="text-green-500" />
                      账号已启用
                   </div>
                   <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition uppercase tracking-widest">
                      进入控制台
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupedStaffList;
