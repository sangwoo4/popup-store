package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.PopupStore.Service.PopupReservationService;
import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.PopupStore.Service.UserReservationService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.UserReservation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@AllArgsConstructor
@RequestMapping("/popup/reservation")
public class PopupReservationController {
    private final UserReservationService userReservationService;
    private final PopupReservationService popupReservationService;
    private final PopupStoreRepository popupStoreRepository;
    private final TokenUtils tokenUtils;

    @PostMapping("/user")
    public ResponseEntity<ResponseDto<UserReservationDto>> userReservation(@RequestHeader("Authorization") String token,
                                                                           @RequestBody UserReservationDto dto) {
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
        dto.setUserId(userId);
        ResponseDto<UserReservationDto> result = userReservationService.userReservation(dto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

//    @PatchMapping("/deadline")
//    public ResponseEntity<String> markReservationAsFull(
//            @RequestParam(name = "popupStoreId") Long popupStoreId,
//            @RequestParam(name = "day") String day) {
//
//        try {
//            popupReservationService.markDayAsFull(popupStoreId, day);
//            return ResponseEntity.ok("예약이 마감되었습니다.");
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("예약 마감 처리 중 오류 발생: " + e.getMessage());
//        }
//    }

    @PatchMapping("/deadline")
    public ResponseEntity<String> markReservationAsFull(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") Integer date) {
        // date로 변경

        try {
            popupReservationService.markDateAsFull(popupStoreId, date);
            return ResponseEntity.ok("예약이 마감되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 마감 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @PatchMapping("/activate")
    public ResponseEntity<String> markReservationAsActive(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") Integer date) {

        try {
            popupReservationService.markDateAsActive(popupStoreId, date);
            return ResponseEntity.ok("예약이 활성화되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 활성화 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<String> getReservationStatus(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") Integer date) {

        try {
            boolean isFull = popupReservationService.isReservationFull(popupStoreId, date);
            if (isFull) {
                return ResponseEntity.ok("마감");
            } else {
                boolean isEnabled = popupReservationService.isReservationEnabled(popupStoreId, date);
                return ResponseEntity.ok(isEnabled ? "활성화" : "비활성화");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 상태 확인 중 오류 발생: " + e.getMessage());
        }
    }
}
