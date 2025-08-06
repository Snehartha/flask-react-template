import { JsonObject } from 'frontend/types/common-types';

export interface Task {
  id: string;
  account_id: string;
  title: string;
  description: string;
}

export interface Comment {
  id: string;
  task_id: string;
  account_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  offset: number;
}

export interface PaginationResult<T> {
  items: T[];
  pagination_params: PaginationParams;
  total_count: number;
  total_pages: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export class TaskEntity implements Task {
  id: string;
  account_id: string;
  title: string;
  description: string;

  constructor(json: JsonObject) {
    this.id = json.id as string;
    this.account_id = json.account_id as string;
    this.title = json.title as string;
    this.description = json.description as string;
  }
}

export class CommentEntity implements Comment {
  id: string;
  task_id: string;
  account_id: string;
  content: string;
  created_at: string;
  updated_at: string;

  constructor(json: JsonObject) {
    this.id = json.id as string;
    this.task_id = json.task_id as string;
    this.account_id = json.account_id as string;
    this.content = json.content as string;
    this.created_at = json.created_at as string;
    this.updated_at = json.updated_at as string;
  }
}