import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
import DoctorDialog from '@/features/doctors/components/DoctorDialog';
import {
    ChevronLeft,
    ChevronRight,
    FileUp,
    Loader2,
    Plus
} from 'lucide-react';
import React, { useCallback, useState, useTransition } from 'react';
import { useDeleteDoctor, useDoctors } from '../hooks/useDoctors';
import type { Doctor, DoctorListParams } from '../types';
import DoctorSearchForm from './list/DoctorSearchForm';
import DoctorTableRow from './list/DoctorTableRow';

const DoctorList: React.FC = () => {
  const [params, setParams] = useState<DoctorListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
  });

  const [isPending, startTransition] = useTransition();
  const { data: resp, isLoading, isError } = useDoctors(params);
  const deleteMutation = useDeleteDoctor();
  const { confirm } = useConfirm();
  const message = useMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleSearch = useCallback((newParams: Partial<DoctorListParams>) => {
    startTransition(() => {
      setParams(prev => ({ ...prev, ...newParams }));
    });
  }, []);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams(p => ({ ...p, page: newPage }));
    });
  };

  const handleAdd = useCallback(() => {
    setSelectedDoctor(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    const ok = await confirm({
      title: '删除确认',
      message: '确定要删除该医生档案吗？删除后该账号将无法登录系统，此操作不可恢复。',
      confirmLabel: '删除',
      variant: 'danger'
    });

    if (ok) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          message.success('医生档案删除成功');
        },
        onError: (err: any) => {
          message.error(err.response?.data?.message || '删除失败');
        }
      });
    }
  }, [deleteMutation, confirm, message]);

  const handleImport = () => {
    message.info('批量导入功能开发中');
  };

  return (
    <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">医生管理</h1>
          <p className="text-sm text-gray-500 mt-1">维护全院医生基础信息、执业档案及系统权限</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <FileUp size={16} />
            批量导入
          </button>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <Plus size={16} />
            新增医生
          </button>
        </div>
      </div>

      <DoctorSearchForm initialParams={params} onSearch={handleSearch} />

      <div className="bg-white border border-gray-200 rounded-lg relative shadow-sm overflow-hidden">
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/60 z-20 flex justify-center items-center backdrop-blur-[1px]">
            <Loader2 className="animate-spin text-blue-600 space-x-2" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left pl-6">医生信息</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">科室 / 职称</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">联系方式</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色权限</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">加入时间</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-rose-600 text-sm font-medium">
                    数据加载失败，请检查网络或刷新重试。
                    <div className="mt-4">
                      <button onClick={() => setParams({...params})} className="px-4 py-2 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors">重试</button>
                    </div>
                  </td>
                </tr>
              ) : resp?.data?.list?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-gray-400 text-sm italic">
                    暂无相关医生档案数据
                  </td>
                </tr>
              ) : (
                resp?.data?.list?.map((doctor: Doctor) => (
                  <DoctorTableRow 
                    key={doctor.id}
                    doctor={doctor}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
           <div className="font-medium">
              共 <span className="text-gray-900 font-bold">{resp?.data?.total || 0}</span> 条医生记录
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <span className="text-gray-500">每页</span>
                 <select 
                   className="border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium"
                   value={params.pageSize}
                   onChange={e => handleSearch({ pageSize: Number(e.target.value), page: 1 })}
                 >
                   {[10, 20, 50, 100].map(size => (
                     <option key={size} value={size}>{size}</option>
                   ))}
                 </select>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  disabled={params.page === 1 || isPending}
                  onClick={() => handlePageChange(params.page - 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center font-medium text-gray-700">
                  <span className="px-2">{params.page}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="px-2 text-gray-400 font-normal">{Math.ceil((resp?.data?.total || 1) / params.pageSize)}</span>
                </div>

                <button 
                  disabled={!resp?.data || params.page * params.pageSize >= resp.data.total || isPending}
                  onClick={() => handlePageChange(params.page + 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
           </div>
        </div>
      </div>

      <DoctorDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        doctor={selectedDoctor} 
      />
    </div>
  );
};

export default DoctorList;
