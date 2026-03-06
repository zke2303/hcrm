import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
import { Building2, ChevronDown, ChevronRight, Folder, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useDeleteDept, useDeptTree, useUpdateDeptHierarchy } from '../hooks/useOrg';
import type { DepartmentTreeVO } from '../types';
import DeptDialog from './DeptDialog';

interface OrgTreeProps {
  selectedId?: number;
  onSelect: (id: number) => void;
}

const TreeNode: React.FC<{
  node: DepartmentTreeVO;
  depth: number;
  selectedId?: number;
  onSelect: (id: number) => void;
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  onAddChild: (node: DepartmentTreeVO) => void;
  onDelete: (id: number) => void;
  onDragStart: (e: React.DragEvent, node: DepartmentTreeVO) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetNode: DepartmentTreeVO) => void;
}> = ({ 
  node, depth, selectedId, onSelect, expandedIds, toggleExpand,
  onAddChild, onDelete,
  onDragStart, onDragOver, onDrop
}) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={handleDragOver}
        onDrop={(e) => onDrop(e, node)}
        onClick={() => onSelect(node.id)}
        className={`group flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
            className={`p-0.5 rounded transition-colors ${isSelected ? 'hover:bg-blue-500' : 'hover:bg-gray-200'}`}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : <div className="w-3.5" />}
          </div>
          <GripVertical size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity cursor-grab ${isSelected ? 'text-white' : 'text-gray-400'}`} />
          {node.type === 1 ? (
             <Building2 size={16} className={isSelected ? 'text-blue-100' : 'text-blue-600'} />
          ) : (
             <Folder size={16} className={isSelected ? 'text-blue-100' : 'text-orange-400'} />
          )}
          <span className="text-sm font-medium truncate">{node.name}</span>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'text-white' : ''}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
             className={`p-1 rounded hover:bg-black/10 transition-colors`}
             title="新增下级"
           >
             <Plus size={14} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
             className={`p-1 rounded hover:bg-black/10 transition-colors ${isSelected ? 'hover:text-red-100' : 'hover:text-red-500'}`}
             title="删除节点"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              selectedId={selectedId} 
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

const OrgTree: React.FC<OrgTreeProps> = ({ selectedId, onSelect }) => {
  const { data: tree, isLoading } = useDeptTree();
  const updateHierarchy = useUpdateDeptHierarchy();
  const deleteDept = useDeleteDept();
  const { confirm } = useConfirm();
  const message = useMessage();

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parentDept, setParentDept] = useState<DepartmentTreeVO | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddChild = (parent: DepartmentTreeVO) => {
    setParentDept(parent);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '删除节点确认',
      message: '确定要删除该组织节点吗？如果该节点下包含子节点或已分配人员，可能导致删除失败。',
      confirmLabel: '确定删除',
      variant: 'danger'
    });

    if (ok) {
      try {
        await deleteDept.mutateAsync(id);
        message.success('节点删除成功');
      } catch (err: any) {
        message.error(err.response?.data?.message || '删除失败，请检查是否包含子节点或人员');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, node: DepartmentTreeVO) => {
    e.dataTransfer.setData('sourceId', node.id.toString());
    e.dataTransfer.setData('sourceType', node.type.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetNode: DepartmentTreeVO) => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData('sourceId'));
    const sourceType = parseInt(e.dataTransfer.getData('sourceType'));
    
    if (sourceId === targetNode.id) return;

    // 逻辑验证：医院(1) 不能进入 医院(1)
    if (sourceType === 1 && targetNode.type === 1) {
      message.error('医院节点无法嵌套在医院节点内');
      return;
    }

    try {
      await updateHierarchy.mutateAsync({
        id: sourceId,
        data: { parentId: targetNode.id }
      });
      message.success('组织架构调整成功');
    } catch (err) {
      message.error('架构调整失败');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs text-gray-400 font-medium">加载架构中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2 px-2">
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">全院架构树</span>
         <button 
           onClick={() => { setParentDept(null); setDialogOpen(true); }}
           className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           title="新增顶级节点"
         >
           <Plus size={14} />
         </button>
      </div>

      {tree?.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          depth={0} 
          selectedId={selectedId} 
          onSelect={onSelect}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onAddChild={handleAddChild}
          onDelete={handleDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}

      {dialogOpen && (
        <DeptDialog 
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          parent={parentDept}
        />
      )}
    </div>
  );
};

export default OrgTree;
