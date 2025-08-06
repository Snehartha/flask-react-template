class CommentService:
    @staticmethod
    def create_comment(params: CreateCommentParams) -> Comment:
        return CommentWriter.create_comment(params)

    @staticmethod
    def get_comment(params: GetCommentParams) -> Comment:
        return CommentReader.get_comment(params)

    @staticmethod
    def get_paginated_comments(params: GetPaginatedCommentsParams) -> PaginationResult[Comment]:
        return CommentReader.get_paginated_comments(params)

    @staticmethod
    def update_comment(params: UpdateCommentParams) -> Comment:
        return CommentWriter.update_comment(params)

    @staticmethod
    def delete_comment(params: DeleteCommentParams) -> CommentDeletionResult:
        return CommentWriter.delete_comment(params)
