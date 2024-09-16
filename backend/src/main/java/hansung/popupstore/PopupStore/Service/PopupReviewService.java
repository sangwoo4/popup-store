package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.PopupReviewRepository;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.model.PopupReview;
import hansung.popupstore.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository reviewRepository;
    private final UserRepository userRepository;  // UserRepository 추가

    public void registerReview(PopupReviewDto reviewDto) {
        PopupReview review = new PopupReview();
        review.setPopupStoreId(reviewDto.getPopupStoreId());
        review.setReviewText(reviewDto.getReviewText());
        review.setLocalDate(reviewDto.getLocalDate());

        // userId를 통해 User 엔티티를 조회하여 설정
        User user = userRepository.findById(reviewDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        review.setUser(user); // User 엔티티 설정

        reviewRepository.save(review);
    }

    // 리뷰 삭제
    public boolean deleteReview(Long reviewId, Long userId) {
        PopupReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getId().equals(userId)) {
            return false;
        }

        // 리뷰 삭제
        reviewRepository.delete(review);
        return true;
    }

    // 마이페이지 기능으로 사용자 ID로 리뷰 목록 조회 기능 추가
    public List<PopupReviewDto> getReviewsByUserId(Long userId) {
        List<PopupReview> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(review -> new PopupReviewDto(
                        review.getPopupStoreId(),
                        review.getUser().getId(),  // User 객체에서 ID 가져오기
                        review.getReviewText(),
                        review.getLocalDate()))
                .collect(Collectors.toList());
    }

    // 특정 리뷰를 ID로 조회하는 메서드 추가
    public PopupReviewDto getPopupReview(Long reviewId) {
        PopupReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("해당 리뷰를 찾을 수 없습니다."));

        return new PopupReviewDto(
                review.getPopupStoreId(),
                review.getUser().getId(),
                review.getReviewText(),
                review.getLocalDate());
    }
}