package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupReviewService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.dto.PopupReviewDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/popup/review")
@RequiredArgsConstructor
public class PopupStoreReviewController {
    private final PopupReviewService popupReviewService;
    private final TokenUtils tokenUtils;
    @PostMapping("/register")
    public ResponseEntity<String> registerReview(
            @RequestHeader("Authorization") String token, @RequestBody PopupReviewDto reviewDto) {
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
        reviewDto.setUserId(userId);
        try {
            popupReviewService.registerReview(reviewDto);
            return ResponseEntity.ok("리뷰가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<String> deleteReview(
            @RequestHeader("Authorization") String token,
            @PathVariable("reviewId") Long reviewId) {
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);

        try {
            // 해당 리뷰가 존재하는지 확인하고, 해당 사용자가 작성자인지 확인
            boolean isDeleted = popupReviewService.deleteReview(reviewId, userId);

            if (isDeleted) {
                return ResponseEntity.ok("리뷰가 성공적으로 삭제되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("리뷰 삭제 권한이 없습니다.");
            }
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 리뷰를 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}