import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { TaskService } from 'frontend/services';
import { Task, Comment, PaginationResult, CreateCommentRequest, UpdateCommentRequest } from 'frontend/types';
import { CommentCard, CommentForm } from 'frontend/components/task';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';
import routes from 'frontend/constants/routes';

interface CommentsPageState {
  task: Task | null;
  comments: PaginationResult<Comment> | null;
  isLoading: boolean;
  isCreating: boolean;
  editingComment: Comment | null;
  showForm: boolean;
  currentPage: number;
}

const CommentsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const taskService = new TaskService();

  const [state, setState] = useState<CommentsPageState>({
    task: null,
    comments: null,
    isLoading: true,
    isCreating: false,
    editingComment: null,
    showForm: false,
    currentPage: 1,
  });

  const loadTaskAndComments = async (page: number = 1) => {
    if (!taskId) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Load task details and comments in parallel
      const [taskResponse, commentsResponse] = await Promise.all([
        taskService.getTask(taskId),
        taskService.getComments(taskId, page, 10)
      ]);

      if (taskResponse.error) {
        toast.error(taskResponse.error.message);
        navigate(routes.TASKS);
        return;
      }

      if (commentsResponse.error) {
        toast.error(commentsResponse.error.message);
      }

      setState(prev => ({ 
        ...prev, 
        task: taskResponse.data || null,
        comments: commentsResponse.data || null,
        currentPage: page,
        isLoading: false 
      }));
    } catch (error) {
      toast.error('Failed to load task details');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadTaskAndComments();
  }, [taskId]);

  const handleCreateComment = async (commentData: CreateCommentRequest) => {
    if (!taskId) return;

    setState(prev => ({ ...prev, isCreating: true }));
    try {
      const response = await taskService.createComment(taskId, commentData);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Comment added successfully!');
        setState(prev => ({ 
          ...prev, 
          showForm: false, 
          isCreating: false 
        }));
        loadTaskAndComments(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to add comment');
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  const handleUpdateComment = async (commentData: UpdateCommentRequest) => {
    if (!state.editingComment) return;

    setState(prev => ({ ...prev, isCreating: true }));
    try {
      const response = await taskService.updateComment(state.editingComment.id, commentData);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Comment updated successfully!');
        setState(prev => ({ 
          ...prev, 
          showForm: false, 
          editingComment: null, 
          isCreating: false 
        }));
        loadTaskAndComments(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to update comment');
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await taskService.deleteComment(commentId);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Comment deleted successfully!');
        loadTaskAndComments(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setState(prev => ({ 
      ...prev, 
      editingComment: comment, 
      showForm: true 
    }));
  };

  const handlePageChange = (page: number) => {
    loadTaskAndComments(page);
  };

  const handleCancelForm = () => {
    setState(prev => ({ 
      ...prev, 
      showForm: false, 
      editingComment: null 
    }));
  };

  const handleNewComment = () => {
    setState(prev => ({ 
      ...prev, 
      showForm: true, 
      editingComment: null 
    }));
  };

  const handleBackToTasks = () => {
    navigate(routes.TASKS);
  };

  if (state.isLoading && !state.task) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!state.task) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Task not found</div>
        <Button onClick={handleBackToTasks}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Button
              kind={ButtonKind.SECONDARY}
              onClick={handleBackToTasks}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ← Back to Tasks
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {state.task.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {state.task.description}
          </p>
        </div>
        {!state.showForm && (
          <Button
            onClick={handleNewComment}
            className="px-6 py-3"
          >
            Add Comment
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {state.showForm && (
        <div className="bg-white rounded-lg border border-stroke p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {state.editingComment ? 'Edit Comment' : 'Add New Comment'}
          </h3>
          <CommentForm
            comment={state.editingComment || undefined}
            onSubmit={state.editingComment ? handleUpdateComment : handleCreateComment}
            onCancel={handleCancelForm}
            isLoading={state.isCreating}
          />
        </div>
      )}

      {/* Comments Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Comments {state.comments && `(${state.comments.total_count})`}
        </h2>

        {state.isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : state.comments && state.comments.items.length > 0 ? (
          <>
            <div className="space-y-4">
              {state.comments.items.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>

            {/* Pagination */}
            {state.comments.total_pages > 1 && (
              <div className="flex items-center justify-between bg-white border border-stroke rounded-lg p-4 mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((state.comments.pagination_params.page - 1) * state.comments.pagination_params.size) + 1} to{' '}
                  {Math.min(state.comments.pagination_params.page * state.comments.pagination_params.size, state.comments.total_count)} of{' '}
                  {state.comments.total_count} comments
                </div>
                
                <div className="flex gap-2">
                  <Button
                    kind={ButtonKind.SECONDARY}
                    onClick={() => handlePageChange(state.comments!.pagination_params.page - 1)}
                    disabled={state.comments.pagination_params.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <Button
                    kind={ButtonKind.SECONDARY}
                    onClick={() => handlePageChange(state.comments!.pagination_params.page + 1)}
                    disabled={state.comments.pagination_params.page === state.comments.total_pages}
                    className="px-3 py-1 text-sm border border-gray-300 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-stroke">
            <div className="text-gray-500 text-lg mb-2">No comments yet</div>
            <p className="text-gray-400 mb-4">Be the first to add a comment!</p>
            {!state.showForm && (
              <Button onClick={handleNewComment}>
                Add Comment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;