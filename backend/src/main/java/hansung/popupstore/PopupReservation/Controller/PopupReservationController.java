package hansung.popupstore.PopupReservation.Controller;

import hansung.popupstore.PopupReservation.Service.ReservationStatusService;
import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.PopupReservation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@AllArgsConstructor
@RequestMapping("/popup/reservation")
public class PopupReservationController {
    private final UserReservationService userReservationService;

    private final ReservationStatusService reservationStatusService;
    private final TokenUtils tokenUtils;

//    @PostMapping("/user")
//    public ResponseEntity<ResponseDto<PopupReservation>> userReservation(@RequestHeader("Authorization") String token,
//                                                                         @RequestBody UserReservationDto dto) {
//        String jwtToken = tokenUtils.extractToken(token);
//        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
//        dto.setUserId(userId);
//        ResponseDto<PopupReservation> result = userReservationService.userReservation(dto);
//        return new ResponseEntity<>(result, HttpStatus.OK);
//    }

    @PostMapping("/user")
    public ResponseEntity<ResponseDto<Map<String, Object>>> userReservation(
            @RequestHeader("Authorization") String token,
            @RequestBody UserReservationDto dto) {

        // 토큰에서 JWT 추출 및 사용자 ID 추출
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
        dto.setUserId(userId);

        // 예약 처리 서비스 호출
        ResponseDto<Map<String, Object>> result = userReservationService.userReservation(dto);

        // HTTP 응답 반환
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PatchMapping("/deadline")
    public ResponseEntity<String> markReservationAsFull(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") String date) {
        try {
            reservationStatusService.markDateAsFull(popupStoreId, date);
            return ResponseEntity.ok("예약이 마감되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 마감 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @PatchMapping("/activate")
    public ResponseEntity<String> markReservationAsActive(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") String date) {

        try {
            reservationStatusService.markDateAsActive(popupStoreId, date);
            return ResponseEntity.ok("예약이 활성화되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 활성화 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<String> getReservationStatus(
            @RequestParam(name = "popupStoreId") Long popupStoreId,
            @RequestParam(name = "date") String date) {

        try {
            boolean isFull = reservationStatusService.isReservationFull(popupStoreId, date);
            if (isFull) {
                return ResponseEntity.ok("마감");
            } else {
                boolean isEnabled = reservationStatusService.isReservationEnabled(popupStoreId, date);
                return ResponseEntity.ok(isEnabled ? "활성화" : "비활성화");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("예약 상태 확인 중 오류 발생: " + e.getMessage());
        }
    }
}
