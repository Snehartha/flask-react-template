from flask import Blueprint

from modules.comment.rest_api.comment_view import CommentView


class CommentRouter:
    @staticmethod
    def create_route(*, blueprint: Blueprint) -> Blueprint:
        # Create comment for a task: POST /accounts/<account_id>/tasks/<task_id>/comments
        blueprint.add_url_rule(
            "/accounts/<account_id>/tasks/<task_id>/comments",
            view_func=CommentView.as_view("comment_create_view"),
            methods=["POST"]
        )
        
        # Get comments for a task: GET /accounts/<account_id>/tasks/<task_id>/comments
        blueprint.add_url_rule(
            "/accounts/<account_id>/tasks/<task_id>/comments",
            view_func=CommentView.as_view("comment_list_view"),
            methods=["GET"]
        )
        
        # Get, update, delete specific comment: GET/PATCH/DELETE /accounts/<account_id>/comments/<comment_id>
        blueprint.add_url_rule(
            "/accounts/<account_id>/comments/<comment_id>",
            view_func=CommentView.as_view("comment_detail_view"),
            methods=["GET", "PATCH", "DELETE"]
        )

        return blueprint