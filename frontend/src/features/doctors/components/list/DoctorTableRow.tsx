import { Calendar, Edit2, Mail, Phone, Trash2, User as UserIcon } from 'lucide-react';
import React from 'react';
import type { Doctor } from '../../types';

interface DoctorTableRowProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: number) => void;
}

const DoctorTableRow: React.FC<DoctorTableRowProps> = ({ doctor, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
            {doctor.avatarUrl ? (
              <img src={doctor.avatarUrl} alt={doctor.realName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {doctor.realName}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              ID: {doctor.id} | {doctor.employeeNo}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col items-center gap-1.5">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium px-2.5 py-0.5 text-xs">
            {doctor.departmentName}
          </span>
          <span className="text-xs text-gray-600 font-medium">{doctor.title}</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Phone size={14} className="text-gray-400" />
            {doctor.phone}
          </div>
          {doctor.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Mail size={12} className="text-gray-400" />
              {doctor.email}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-wrap justify-center gap-1 max-w-[150px] mx-auto">
          {doctor.roles.map(role => (
            <span key={role.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
              {role.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          doctor.status === 1 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${doctor.status === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {doctor.status === 1 ? '在职' : '离职'}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
          <Calendar size={14} className="text-gray-400" />
          {new Date(doctor.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => onEdit(doctor)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold border border-blue-100"
          >
            <Edit2 size={14} />
            编辑
          </button>
          <button
            onClick={() => onDelete(doctor.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold border border-rose-100"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DoctorTableRow;
