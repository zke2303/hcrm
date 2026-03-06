import { RotateCcw, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTitles } from '../../hooks/useUsers';
import type { UserListParams } from '../../types';

interface UserSearchFormProps {
  onSearch: (params: Partial<UserListParams>) => void;
  initialParams: UserListParams;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({ onSearch, initialParams }) => {
  const [keyword, setKeyword] = useState(initialParams.keyword || '');
  const [status, setStatus] = useState<number | undefined>(initialParams.status);
  const [title, setTitle] = useState(initialParams.title || '');

  const { data: titlesResp } = useTitles();
  const titles = titlesResp || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword, status, title, page: 1 });
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(undefined);
    setTitle('');
    onSearch({ keyword: '', status: undefined, title: '', page: 1 });
  };

  return (
    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-6 font-sans shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">关键字搜索</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索账号/姓名/手机号/工号/备注"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[140px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">账号状态</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none outline-none"
            value={status ?? ''}
            onChange={e => setStatus(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">全部状态</option>
            <option value="1">正常</option>
            <option value="0">禁用</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">职称 / 职务</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
          >
            <option value="">全部职称</option>
            {titles.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
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

export default React.memo(UserSearchForm);
