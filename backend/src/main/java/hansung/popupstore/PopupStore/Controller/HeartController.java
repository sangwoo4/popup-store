package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.HeartService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.HeartDto;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@AllArgsConstructor
@RequestMapping("/heart")
public class HeartController {

    private final HeartService heartService;
    private final TokenUtils tokenUtils;

    @PostMapping
    public ResponseEntity<ResponseDto<HeartDto>> addHeart(
            @RequestHeader("Authorization") String token,
            @RequestBody HeartDto heartDto) {

        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);

        ResponseDto<HeartDto> response = heartService.addHeart(userId, heartDto.getPopupStoreId());

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<HeartDto>>> getHeartedPopupStores(
            @RequestHeader("Authorization") String token) {

        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);

        ResponseDto<List<HeartDto>> response = heartService.getHeartedPopupStores(userId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ResponseDto<?>> removeHeart(
            @RequestHeader("Authorization") String token,
            @RequestBody HeartDto heartDto) {

        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);

        ResponseDto<?> response = heartService.removeHeart(userId, heartDto.getPopupStoreId());

        return ResponseEntity.ok(response);
    }
}