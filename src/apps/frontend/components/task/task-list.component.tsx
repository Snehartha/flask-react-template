import React from 'react';

import { Task, PaginationResult } from 'frontend/types';
import TaskCard from './task-card.component';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';

interface TaskListProps {
  tasks: PaginationResult<Task>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewComments: (taskId: string) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onViewComments,
  onPageChange,
  isLoading = false,
}) => {
  const { items, pagination_params, total_count, total_pages } = tasks;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tasks found</div>
        <p className="text-gray-400">Create your first task to get started!</p>
      </div>
    );
  }

  const canGoPrevious = pagination_params.page > 1;
  const canGoNext = pagination_params.page < total_pages;

  return (
    <div>
      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {items.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewComments={onViewComments}
          />
        ))}
      </div>

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex items-center justify-between bg-white border border-stroke rounded-lg p-4">
          <div className="text-sm text-gray-700">
            Showing {((pagination_params.page - 1) * pagination_params.size) + 1} to{' '}
            {Math.min(pagination_params.page * pagination_params.size, total_count)} of{' '}
            {total_count} tasks
          </div>
          
          <div className="flex gap-2">
            <Button
              kind={ButtonKind.SECONDARY}
              onClick={() => onPageChange(pagination_params.page - 1)}
              disabled={!canGoPrevious}
              className="px-3 py-1 text-sm border border-gray-300 disabled:opacity-50"
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                let pageNum;
                if (total_pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination_params.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination_params.page >= total_pages - 2) {
                  pageNum = total_pages - 4 + i;
                } else {
                  pageNum = pagination_params.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    kind={pageNum === pagination_params.page ? ButtonKind.PRIMARY : ButtonKind.SECONDARY}
                    onClick={() => onPageChange(pageNum)}
                    className="px-3 py-1 text-sm min-w-[2rem] border border-gray-300"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              kind={ButtonKind.SECONDARY}
              onClick={() => onPageChange(pagination_params.page + 1)}
              disabled={!canGoNext}
              className="px-3 py-1 text-sm border border-gray-300 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;