import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { TaskService } from 'frontend/services';
import { Task, PaginationResult, CreateTaskRequest, UpdateTaskRequest } from 'frontend/types';
import { TaskList, TaskForm } from 'frontend/components/task';
import Button from 'frontend/components/button';
import { ButtonKind } from 'frontend/types/button';
import routes from 'frontend/constants/routes';

interface TasksPageState {
  tasks: PaginationResult<Task> | null;
  isLoading: boolean;
  isCreating: boolean;
  editingTask: Task | null;
  showForm: boolean;
  currentPage: number;
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const taskService = new TaskService();

  const [state, setState] = useState<TasksPageState>({
    tasks: null,
    isLoading: true,
    isCreating: false,
    editingTask: null,
    showForm: false,
    currentPage: 1,
  });

  const loadTasks = async (page: number = 1) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await taskService.getTasks(page, 9); // 9 tasks per page for 3x3 grid
      if (response.error) {
        toast.error(response.error.message);
      } else if (response.data) {
        setState(prev => ({ 
          ...prev, 
          tasks: response.data!, 
          currentPage: page,
          isLoading: false 
        }));
      }
    } catch (error) {
      toast.error('Failed to load tasks');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    setState(prev => ({ ...prev, isCreating: true }));
    try {
      const response = await taskService.createTask(taskData);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Task created successfully!');
        setState(prev => ({ 
          ...prev, 
          showForm: false, 
          isCreating: false 
        }));
        loadTasks(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to create task');
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskRequest) => {
    if (!state.editingTask) return;

    setState(prev => ({ ...prev, isCreating: true }));
    try {
      const response = await taskService.updateTask(state.editingTask.id, taskData);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Task updated successfully!');
        setState(prev => ({ 
          ...prev, 
          showForm: false, 
          editingTask: null, 
          isCreating: false 
        }));
        loadTasks(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to update task');
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await taskService.deleteTask(taskId);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success('Task deleted successfully!');
        loadTasks(state.currentPage); // Refresh current page
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setState(prev => ({ 
      ...prev, 
      editingTask: task, 
      showForm: true 
    }));
  };

  const handleViewComments = (taskId: string) => {
    navigate(`${routes.TASKS}/${taskId}/comments`);
  };

  const handlePageChange = (page: number) => {
    loadTasks(page);
  };

  const handleCancelForm = () => {
    setState(prev => ({ 
      ...prev, 
      showForm: false, 
      editingTask: null 
    }));
  };

  const handleNewTask = () => {
    setState(prev => ({ 
      ...prev, 
      showForm: true, 
      editingTask: null 
    }));
  };

  if (state.isLoading && !state.tasks) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks and track progress
          </p>
        </div>
        {!state.showForm && (
          <Button
            onClick={handleNewTask}
            className="px-6 py-3"
          >
            New Task
          </Button>
        )}
      </div>

      {/* Task Form */}
      {state.showForm && (
        <div className="mb-8">
          <TaskForm
            task={state.editingTask || undefined}
            onSubmit={state.editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            isLoading={state.isCreating}
            title={state.editingTask ? 'Edit Task' : 'Create New Task'}
          />
        </div>
      )}

      {/* Task List */}
      {state.tasks && (
        <TaskList
          tasks={state.tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onViewComments={handleViewComments}
          onPageChange={handlePageChange}
          isLoading={state.isLoading}
        />
      )}
    </div>
  );
};

export default TasksPage;