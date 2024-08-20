//package hansung.popupstore.PopupStore.Controller;
//
//import hansung.popupstore.PopupStore.Service.ReviewService;
//import hansung.popupstore.dto.ReviewDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/popup/review")
//@RequiredArgsConstructor
//public class PopupStoreReviewController {
//
//    private final ReviewService reviewService;
//
//    @PostMapping("/register")
//    public ResponseEntity<String> registerReview(@RequestBody ReviewDto reviewDto) {
//        try {
//            reviewService.registerReview(reviewDto);
//            return ResponseEntity.ok("리뷰가 성공적으로 등록되었습니다.");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
//        }
//    }
//}