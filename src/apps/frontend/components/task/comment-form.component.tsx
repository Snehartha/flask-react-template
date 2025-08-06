import React, { useState, useEffect } from 'react';

import { Comment, CreateCommentRequest, UpdateCommentRequest } from 'frontend/types';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';

interface CommentFormProps {
  comment?: Comment;
  onSubmit: (commentData: CreateCommentRequest | UpdateCommentRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  comment,
  onSubmit,
  onCancel,
  isLoading = false,
  placeholder = "Write a comment...",
}) => {
  const [content, setContent] = useState(comment?.content || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (comment) {
      setContent(comment.content);
    }
  }, [comment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment content is required');
      return;
    }

    onSubmit({
      content: content.trim(),
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <div className="w-full rounded-lg border bg-white p-3 outline-none focus-within:border-primary focus-visible:shadow-none border-stroke">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            disabled={isLoading}
            rows={3}
            className="w-full flex-1 appearance-none outline-none resize-none"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          kind={ButtonKind.SECONDARY}
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !content.trim()}
          className="px-4 py-2 text-sm"
        >
          {comment ? 'Update' : 'Post'} Comment
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;