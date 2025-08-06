import React, { useState, useEffect } from 'react';

import { Task, CreateTaskRequest, UpdateTaskRequest } from 'frontend/types';
import Button from 'frontend/components/button';
import Input from 'frontend/components/input';
import FormControl from 'frontend/components/form-control';
import { ButtonKind } from 'frontend/types/button';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
  title,
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
    };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stroke p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormControl
          label="Title"
          error={errors.title}
          required
        >
          <Input
            value={formData.title}
            onChange={handleInputChange('title')}
            placeholder="Enter task title"
            error={errors.title}
            disabled={isLoading}
          />
        </FormControl>

        <FormControl
          label="Description"
          error={errors.description}
          required
        >
          <div className="w-full rounded-lg border bg-white p-4 outline-none focus:border-primary focus-visible:shadow-none border-stroke">
            <textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Enter task description"
              disabled={isLoading}
              rows={4}
              className="w-full flex-1 appearance-none outline-none resize-none"
            />
          </div>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </FormControl>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
          <Button
            kind={ButtonKind.SECONDARY}
            onClick={onCancel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;