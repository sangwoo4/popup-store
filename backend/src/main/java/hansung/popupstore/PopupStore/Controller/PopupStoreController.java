package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopUpStoreManagementService;
import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/")
public class PopupStoreController {
    private final PopUpStoreManagementService popUpStoreManagementService;
    private final PopupStoreService popupStoreService;
    private final TokenUtils tokenUtils;


    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id,
                                                    @RequestHeader(value = "Authorization", required = false) String token,
                                                    HttpServletRequest request) {
        // 토큰이 null인 경우 처리
        String jwtToken = null;
        Long userId = null;

        if (token != null && token.startsWith("Bearer ")) {
            jwtToken = token.substring(7); // 'Bearer ' 제거
            try {
                userId = tokenUtils.extractCompanyIdFromToken(jwtToken);
            } catch (Exception e) {
                // 로그에 예외 기록 및 기본값 설정 (예: 로그인 안 된 사용자 처리)
                System.err.println("Failed to extract userId from token: " + e.getMessage());
                // 예외를 던지거나 기본값으로 처리할 수 있음
            }
        }

        // 조회수 증가 처리
        popupStoreService.incrementViewCount(id, userId, request);

        // 팝업 스토어 상세 정보 조회
        ResponseDto<?> result = popUpStoreManagementService.getDetail(id);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
