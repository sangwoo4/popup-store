package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupReviewService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.dto.PopupReviewDto;
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
}