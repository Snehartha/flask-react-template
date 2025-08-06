from modules.comment.types import CommentErrorCode
from modules.task.types import TaskErrorCode
from tests.modules.comment.base_test_comment import BaseTestComment


class TestCommentRestApi(BaseTestComment):
    def setUp(self) -> None:
        super().setUp()
        self.account, self.token = self.create_account_and_get_token()
        self.task = self.create_test_task(account_id=self.account.id)

    def test_create_comment_success(self) -> None:
        comment_data = {"content": "This is a test comment"}

        response = self.make_authenticated_comment_request(
            method="POST",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            data=comment_data
        )

        assert response.status_code == 201
        self.assert_comment_response(
            response.json,
            task_id=self.task.id,
            account_id=self.account.id,
            content="This is a test comment"
        )

    def test_create_comment_missing_content(self) -> None:
        comment_data = {}

        response = self.make_authenticated_comment_request(
            method="POST",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            data=comment_data
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

    def test_create_comment_empty_content(self) -> None:
        comment_data = {"content": "   "}

        response = self.make_authenticated_comment_request(
            method="POST",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            data=comment_data
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

    def test_create_comment_for_nonexistent_task(self) -> None:
        non_existent_task_id = "507f1f77bcf86cd799439011"
        comment_data = {"content": "This is a test comment"}

        response = self.make_authenticated_comment_request(
            method="POST",
            account_id=self.account.id,
            token=self.token,
            task_id=non_existent_task_id,
            data=comment_data
        )

        self.assert_error_response(response, 404, CommentErrorCode.TASK_NOT_FOUND)

    def test_create_comment_unauthenticated(self) -> None:
        comment_data = {"content": "This is a test comment"}

        response = self.make_unauthenticated_comment_request(
            method="POST",
            account_id=self.account.id,
            task_id=self.task.id,
            data=comment_data
        )

        assert response.status_code == 401

    def test_get_comments_for_task_empty(self) -> None:
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id
        )

        assert response.status_code == 200
        self.assert_pagination_response(
            response.json,
            expected_items_count=0,
            expected_total_count=0,
            expected_page=1,
            expected_size=10
        )

    def test_get_comments_for_task_with_data(self) -> None:
        # Create test comments
        comments = self.create_multiple_test_comments(
            task_id=self.task.id,
            account_id=self.account.id,
            count=5
        )

        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="page=1&size=3"
        )

        assert response.status_code == 200
        self.assert_pagination_response(
            response.json,
            expected_items_count=3,
            expected_total_count=5,
            expected_page=1,
            expected_size=3
        )

        # Verify the first comment in response
        first_comment = response.json["items"][0]
        self.assert_comment_response(
            first_comment,
            task_id=self.task.id,
            account_id=self.account.id
        )

    def test_get_comments_for_task_pagination(self) -> None:
        self.create_multiple_test_comments(
            task_id=self.task.id,
            account_id=self.account.id,
            count=5
        )

        # Get second page
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="page=2&size=3"
        )

        assert response.status_code == 200
        self.assert_pagination_response(
            response.json,
            expected_items_count=2,
            expected_total_count=5,
            expected_page=2,
            expected_size=3
        )

    def test_get_comments_for_task_unauthenticated(self) -> None:
        response = self.make_unauthenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            task_id=self.task.id
        )

        assert response.status_code == 401

    def test_get_specific_comment_success(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id,
            content="Specific test comment"
        )

        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id
        )

        assert response.status_code == 200
        self.assert_comment_response(
            response.json,
            expected_comment=created_comment
        )

    def test_get_specific_comment_not_found(self) -> None:
        non_existent_comment_id = "507f1f77bcf86cd799439011"

        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            comment_id=non_existent_comment_id
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

    def test_get_specific_comment_unauthenticated(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        response = self.make_unauthenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            comment_id=created_comment.id
        )

        assert response.status_code == 401

    def test_update_comment_success(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id,
            content="Original content"
        )

        update_data = {"content": "Updated content"}

        response = self.make_authenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id,
            data=update_data
        )

        assert response.status_code == 200
        self.assert_comment_response(
            response.json,
            id=created_comment.id,
            task_id=self.task.id,
            account_id=self.account.id,
            content="Updated content"
        )

    def test_update_comment_missing_content(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        update_data = {}

        response = self.make_authenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id,
            data=update_data
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

    def test_update_comment_empty_content(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        update_data = {"content": "   "}

        response = self.make_authenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id,
            data=update_data
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

    def test_update_comment_not_found(self) -> None:
        non_existent_comment_id = "507f1f77bcf86cd799439011"
        update_data = {"content": "Updated content"}

        response = self.make_authenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            token=self.token,
            comment_id=non_existent_comment_id,
            data=update_data
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

    def test_update_comment_unauthenticated(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        update_data = {"content": "Updated content"}

        response = self.make_unauthenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            comment_id=created_comment.id,
            data=update_data
        )

        assert response.status_code == 401

    def test_delete_comment_success(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        response = self.make_authenticated_comment_request(
            method="DELETE",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id
        )

        assert response.status_code == 204

        # Verify comment is deleted
        get_response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            comment_id=created_comment.id
        )
        self.assert_error_response(get_response, 404, CommentErrorCode.NOT_FOUND)

    def test_delete_comment_not_found(self) -> None:
        non_existent_comment_id = "507f1f77bcf86cd799439011"

        response = self.make_authenticated_comment_request(
            method="DELETE",
            account_id=self.account.id,
            token=self.token,
            comment_id=non_existent_comment_id
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

    def test_delete_comment_unauthenticated(self) -> None:
        created_comment = self.create_test_comment(
            task_id=self.task.id,
            account_id=self.account.id
        )

        response = self.make_unauthenticated_comment_request(
            method="DELETE",
            account_id=self.account.id,
            comment_id=created_comment.id
        )

        assert response.status_code == 401

    def test_comment_isolation_between_accounts(self) -> None:
        # Create another account and task
        other_account, other_token = self.create_account_and_get_token(username="other@example.com")
        other_task = self.create_test_task(account_id=other_account.id)

        # Create comment for the other account
        other_comment = self.create_test_comment(
            task_id=other_task.id,
            account_id=other_account.id,
            content="Other account comment"
        )

        # Try to access other account's comment with first account's token
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            comment_id=other_comment.id
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

        # Try to update other account's comment
        response = self.make_authenticated_comment_request(
            method="PATCH",
            account_id=self.account.id,
            token=self.token,
            comment_id=other_comment.id,
            data={"content": "Hacked content"}
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

        # Try to delete other account's comment
        response = self.make_authenticated_comment_request(
            method="DELETE",
            account_id=self.account.id,
            token=self.token,
            comment_id=other_comment.id
        )

        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

    def test_invalid_pagination_parameters(self) -> None:
        # Test negative page
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="page=-1"
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

        # Test negative size
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="size=-1"
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

        # Test zero page
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="page=0"
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

        # Test zero size
        response = self.make_authenticated_comment_request(
            method="GET",
            account_id=self.account.id,
            token=self.token,
            task_id=self.task.id,
            query_params="size=0"
        )

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)