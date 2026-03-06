import { RotateCcw, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useDepartments } from '../../../../features/sys-user/hooks/useUsers';
import type { DoctorListParams } from '../../types';

interface DoctorSearchFormProps {
  initialParams: DoctorListParams;
  onSearch: (params: Partial<DoctorListParams>) => void;
}

const DoctorSearchForm: React.FC<DoctorSearchFormProps> = ({ initialParams, onSearch }) => {
  const [keyword, setKeyword] = useState(initialParams.keyword || '');
  const [departmentId, setDepartmentId] = useState<string>(initialParams.departmentId?.toString() || '');
  const [status, setStatus] = useState<string>(initialParams.status?.toString() || '');

  const { data: departments = [] } = useDepartments();

  const handleReset = () => {
    setKeyword('');
    setDepartmentId('');
    setStatus('');
    onSearch({ keyword: '', departmentId: undefined, status: undefined, page: 1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ 
      keyword, 
      departmentId: departmentId ? Number(departmentId) : undefined,
      status: status ? Number(status) : undefined,
      page: 1 
    });
  };

  return (
    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">关键字搜索</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索医生姓名 / 手机号 / 工号"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">所属科室</label>
          <div className="relative group">
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none outline-none"
            >
              <option value="">全部科室</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">在职状态</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none outline-none"
          >
            <option value="">全部状态</option>
            <option value="1">在职</option>
            <option value="0">离职</option>
          </select>
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
  );
};

export default DoctorSearchForm;
