package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupReviewRepository;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.model.PopupReview;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository reviewRepository;

    public void registerReview(PopupReviewDto reviewDto) {
        PopupReview review = new PopupReview();
        review.setPopupStoreId(reviewDto.getPopupStoreId());
        review.setUserId(reviewDto.getUserId());
        review.setReviewText(reviewDto.getReviewText());
        review.setLocalDateTime(LocalDateTime.now());
        reviewRepository.save(review);
    }

    public boolean deleteReview(Long reviewId, Long userId) {
        // 리뷰를 ID로 조회
        PopupReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        // 리뷰 작성자가 현재 사용자와 일치하는지 확인
        if (!review.getUserId().equals(userId)) {
            return false;  // 작성자가 아니면 삭제할 수 없음
        }

        // 리뷰 삭제
        reviewRepository.delete(review);
        return true;
    }
}