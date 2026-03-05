import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Building2, GripVertical, Loader2 } from 'lucide-react';
import { useDeptTree, useUpdateDeptHierarchy } from '../hooks/useOrg';
import type { DepartmentTreeVO } from '../types';

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
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: number) => void;
}> = ({ 
  node, depth, selectedId, onSelect, expandedIds, toggleExpand,
  onDragStart, onDragOver, onDrop
}) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => onDrop(e, node.id)}
        onClick={() => onSelect(node.id)}
        className={`group flex items-center gap-1.5 py-2 px-2 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex items-center gap-1">
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
        </div>
        <span className="text-sm font-medium truncate">{node.name}</span>
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
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('sourceId', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData('sourceId'));
    
    if (sourceId === targetId) return;

    try {
      await updateHierarchy.mutateAsync({
        id: sourceId,
        data: { parentId: targetId }
      });
    } catch (err) {
      console.error('Failed to update hierarchy', err);
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
      {tree?.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          depth={0} 
          selectedId={selectedId} 
          onSelect={onSelect}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default OrgTree;
