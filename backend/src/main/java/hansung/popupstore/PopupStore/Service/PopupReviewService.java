//package hansung.popupstore.PopupStore.Service;
//
//import hansung.popupstore.PopupStore.Repository.ReviewRepository;
//import hansung.popupstore.model.Review;
//import hansung.popupstore.dto.ReviewDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class ReviewService {
//
//    private final ReviewRepository reviewRepository;
//
//    public void registerReview(ReviewDto reviewDto) {
//        Review review = new Review();
//        review.setPopupStoreId(reviewDto.getPopupStoreId());
//        review.setUserId(reviewDto.getUserId());
//        review.setReviewText(reviewDto.getReviewText());
//        review.setRating(reviewDto.getRating());
//
//        reviewRepository.save(review);
//    }
//}