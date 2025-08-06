import APIService from 'frontend/services/api.service';
import { 
  ApiResponse, 
  TaskEntity, 
  CommentEntity, 
  PaginationResult, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CreateCommentRequest, 
  UpdateCommentRequest 
} from 'frontend/types';
import { JsonObject } from 'frontend/types/common-types';

export default class TaskService extends APIService {
  private getAuthHeaders(): { Authorization: string } {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    return { Authorization: `Bearer ${token}` };
  }

  private getAccountId(): string {
    const accountId = localStorage.getItem('account_id');
    if (!accountId) {
      throw new Error('No account ID found');
    }
    return accountId;
  }

  // Task CRUD operations
  createTask = async (taskData: CreateTaskRequest): Promise<ApiResponse<TaskEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.post<JsonObject>(
      `/accounts/${accountId}/tasks`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new TaskEntity(response.data));
  };

  getTasks = async (page: number = 1, size: number = 10): Promise<ApiResponse<PaginationResult<TaskEntity>>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.get<JsonObject>(
      `/accounts/${accountId}/tasks?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
    
    const paginationResult: PaginationResult<TaskEntity> = {
      items: (response.data.items as JsonObject[]).map(item => new TaskEntity(item)),
      pagination_params: response.data.pagination_params as any,
      total_count: response.data.total_count as number,
      total_pages: response.data.total_pages as number,
    };
    
    return new ApiResponse(paginationResult);
  };

  getTask = async (taskId: string): Promise<ApiResponse<TaskEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.get<JsonObject>(
      `/accounts/${accountId}/tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new TaskEntity(response.data));
  };

  updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<ApiResponse<TaskEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.patch<JsonObject>(
      `/accounts/${accountId}/tasks/${taskId}`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new TaskEntity(response.data));
  };

  deleteTask = async (taskId: string): Promise<ApiResponse<void>> => {
    const accountId = this.getAccountId();
    await this.apiClient.delete(
      `/accounts/${accountId}/tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse<void>();
  };

  // Comment CRUD operations
  createComment = async (taskId: string, commentData: CreateCommentRequest): Promise<ApiResponse<CommentEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.post<JsonObject>(
      `/accounts/${accountId}/tasks/${taskId}/comments`,
      commentData,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new CommentEntity(response.data));
  };

  getComments = async (taskId: string, page: number = 1, size: number = 10): Promise<ApiResponse<PaginationResult<CommentEntity>>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.get<JsonObject>(
      `/accounts/${accountId}/tasks/${taskId}/comments?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
    
    const paginationResult: PaginationResult<CommentEntity> = {
      items: (response.data.items as JsonObject[]).map(item => new CommentEntity(item)),
      pagination_params: response.data.pagination_params as any,
      total_count: response.data.total_count as number,
      total_pages: response.data.total_pages as number,
    };
    
    return new ApiResponse(paginationResult);
  };

  getComment = async (commentId: string): Promise<ApiResponse<CommentEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.get<JsonObject>(
      `/accounts/${accountId}/comments/${commentId}`,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new CommentEntity(response.data));
  };

  updateComment = async (commentId: string, commentData: UpdateCommentRequest): Promise<ApiResponse<CommentEntity>> => {
    const accountId = this.getAccountId();
    const response = await this.apiClient.patch<JsonObject>(
      `/accounts/${accountId}/comments/${commentId}`,
      commentData,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse(new CommentEntity(response.data));
  };

  deleteComment = async (commentId: string): Promise<ApiResponse<void>> => {
    const accountId = this.getAccountId();
    await this.apiClient.delete(
      `/accounts/${accountId}/comments/${commentId}`,
      { headers: this.getAuthHeaders() }
    );
    return new ApiResponse<void>();
  };
}