import clsx from 'clsx';
import React from 'react';

import { Comment } from 'frontend/types';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';

interface CommentCardProps {
  comment: Comment;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  className?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
  className,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={clsx(
        'rounded-lg border border-stroke bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-3">
        <p className="text-gray-800 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          Created: {formatDate(comment.created_at)}
          {comment.updated_at !== comment.created_at && (
            <span className="ml-2">
              • Updated: {formatDate(comment.updated_at)}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            kind={ButtonKind.TERTIARY}
            onClick={() => onEdit(comment)}
            className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50"
          >
            Edit
          </Button>
          <Button
            kind={ButtonKind.TERTIARY}
            onClick={() => onDelete(comment.id)}
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;