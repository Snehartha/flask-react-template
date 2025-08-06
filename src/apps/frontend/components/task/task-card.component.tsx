import clsx from 'clsx';
import React from 'react';

import { Task } from 'frontend/types';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewComments: (taskId: string) => void;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onViewComments,
  className,
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-stroke bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {task.title}
        </h3>
        <p className="text-gray-600 line-clamp-3">
          {task.description}
        </p>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button
          kind={ButtonKind.TERTIARY}
          onClick={() => onViewComments(task.id)}
          className="text-sm px-3 py-1"
        >
          Comments
        </Button>
        <Button
          kind={ButtonKind.SECONDARY}
          onClick={() => onEdit(task)}
          className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50"
        >
          Edit
        </Button>
        <Button
          kind={ButtonKind.TERTIARY}
          onClick={() => onDelete(task.id)}
          className="text-sm px-3 py-1 text-red-600 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TaskCard;