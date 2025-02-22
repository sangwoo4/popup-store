package hansung.popupstore.PopupReservation.Controller;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupReservation.Service.ReservationStatusService;
import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.PopupStore.Repository.UserReservationRepository;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.PopupReservation;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import hansung.popupstore.model.UserReservation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@AllArgsConstructor
@RequestMapping("/popup/reservation")
public class PopupReservationController {
    private final UserReservationService userReservationService;
    private final UserReservationRepository userReservationRepository;
    private final ReservationStatusService reservationStatusService;
    private final TokenUtils tokenUtils;
    private final UserRepository userRepository;

    @PostMapping("/user")
    public ResponseEntity<ResponseDto<Map<String, Object>>> userReservation(
            @RequestHeader("Authorization") String token,
            @RequestBody UserReservationDto dto) {

        // 예약 처리 서비스 호출
        ResponseDto<Map<String, Object>> result = userReservationService.userReservation(token, dto);

        // HTTP 응답 반환
        return new ResponseEntity<>(result, HttpStatus.OK);
    }



    @GetMapping("/user/list")
    public ResponseEntity<ResponseDto<List<Map<String, Object>>>> getAllReservationsByUser(
            @RequestHeader("Authorization") String token) {

        // 토큰에서 JWT 추출 및 사용자 ID 추출
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);

        // 유저의 모든 예약 정보를 가져옴
        ResponseDto<List<Map<String, Object>>> responseDto = userReservationService.userReservationList(userId);

        // 성공 응답 반환
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/list/{popupId}")
    public ResponseEntity<ResponseDto<List<Map<String, Object>>>> getAllReservationsByPopup(
            @PathVariable("popupId") Long popupId) {

        // 특정 팝업 ID에 대한 모든 예약 정보를 가져옴
        ResponseDto<List<Map<String, Object>>> responseDto = userReservationService.getReservationsByPopupId(popupId);

        // 성공 응답 반환
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
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

    @DeleteMapping("/user/cancel")
    public ResponseEntity<ResponseDto<Map<String, Object>>> userCancelReservation(
            @RequestBody UserReservationDto dto){

        ResponseDto<Map<String, Object>> result = userReservationService.userCancelReservation(dto);

        // HTTP 응답 반환
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}



