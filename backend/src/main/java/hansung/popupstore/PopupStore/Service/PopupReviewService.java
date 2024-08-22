package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupReviewRepository;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.model.PopupReview;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository reviewRepository;

    public void registerReview(PopupReviewDto reviewDto) {
        PopupReview review = new PopupReview();
        review.setPopupStoreId(reviewDto.getPopupStoreId());
        review.setUserId(reviewDto.getUserId());
        review.setReviewText(reviewDto.getReviewText());
        review.setLocalDate(reviewDto.getLocalDate());
        reviewRepository.save(review);
    }
}