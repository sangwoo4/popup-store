package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.PopupReviewRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.dto.PopupReviewResponseDto;
import hansung.popupstore.model.PopupReview;
import hansung.popupstore.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PopupReviewService {
    private final PopupReviewRepository popupReviewRepository;
    private final UserRepository userRepository;

    public void registerReview(PopupReviewDto reviewDto) {
        PopupReview review = new PopupReview();
        review.setPopupStoreId(reviewDto.getPopupStoreId());
        review.setReviewText(reviewDto.getReviewText());
        review.setLocalDateTime(LocalDateTime.now());
        popupReviewRepository.save(review);
    }

    public ResponseDto<?> getPopupReview(Long id){
        List<PopupReview> reviews = popupReviewRepository.findAllByPopupStoreId(id);
        List<PopupReviewResponseDto> reviewDtos = reviews.stream().map(review -> {
            // userId로 사용자 닉네임 조회 (UserRepository를 통해 가져온다고 가정)
            String nickname = userRepository.findById(review.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다."))
                    .getNickname();

            return new PopupReviewResponseDto(nickname, review.getReviewText(), review.getLocalDateTime(), review.getId());
        }).collect(Collectors.toList());

        return ResponseDto.setSuccessData("리뷰 조회 결과", reviewDtos);
    }

    public boolean deleteReview(Long reviewId, Long userId) {
        // 리뷰를 ID로 조회
        PopupReview review = popupReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        // 리뷰 작성자가 현재 사용자와 일치하는지 확인
        if (!review.getUser().getId().equals(userId)) {
            return false;  // 작성자가 아니면 삭제할 수 없음
        }

        // 리뷰 삭제
        popupReviewRepository.delete(review);
        return true;
    }

    // 마이페이지 기능으로 사용자 ID로 리뷰 목록 조회 기능 추가
    public List<PopupReviewDto> getReviewsByUserId(Long userId) {
        List<PopupReview> reviews = popupReviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(review -> new PopupReviewDto(
                        review.getPopupStoreId(),
                        review.getUser().getId(),  // User 객체에서 ID 가져오기
                        review.getReviewText(),
                        review.getLocalDateTime()))
                .collect(Collectors.toList());
    }

    // 특정 리뷰를 ID로 조회하는 메서드 추가
//    public PopupReviewDto getPopupReview(Long reviewId) {
//        PopupReview review = reviewRepository.findById(reviewId)
//                .orElseThrow(() -> new EntityNotFoundException("해당 리뷰를 찾을 수 없습니다."));
//
//        return new PopupReviewDto(
//                review.getPopupStoreId(),
//                review.getUser().getId(),
//                review.getReviewText(),
//                review.getLocalDate());
//    }
}