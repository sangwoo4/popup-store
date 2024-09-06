package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupReviewRepository;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.model.PopupReview;
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
}