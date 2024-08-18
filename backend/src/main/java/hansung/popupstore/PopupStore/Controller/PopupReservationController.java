package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.UserReservationService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.UserReservation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@AllArgsConstructor
@RequestMapping("/popup/reservation")
public class PopupReservationController {
    private final UserReservationService userReservationService;
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
}
