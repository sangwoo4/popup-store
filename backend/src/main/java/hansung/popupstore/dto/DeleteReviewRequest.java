package hansung.popupstore.dto;

public class DeleteReviewRequest {
    private Long reviewId;

    // Constructor, Getter, and Setter
    public DeleteReviewRequest() {
    }

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }
}