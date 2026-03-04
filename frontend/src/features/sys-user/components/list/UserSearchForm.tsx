import { RotateCcw, Search } from 'lucide-react';
import React, { useState } from 'react';
import type { UserListParams } from '../../types';

interface UserSearchFormProps {
  onSearch: (params: Partial<UserListParams>) => void;
  initialParams: UserListParams;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({ onSearch, initialParams }) => {
  const [username, setUsername] = useState(initialParams.username || '');
  const [status, setStatus] = useState<number | undefined>(initialParams.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ username, status, page: 1 });
  };

  const handleReset = () => {
    setUsername('');
    setStatus(undefined);
    onSearch({ username: '', status: undefined, page: 1 });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 col-span-1 border-gray-200 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">账号/姓名:</label>
          <input 
            type="text" 
            placeholder="请输入账号或真实姓名"
            className="w-72 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">账号状态:</label>
          <select 
            className="w-48 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status ?? ''}
            onChange={e => setStatus(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">全部</option>
            <option value="1">正常</option>
            <option value="0">禁用</option>
          </select>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            重置
          </button>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Search size={16} />
            查询
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(UserSearchForm);
