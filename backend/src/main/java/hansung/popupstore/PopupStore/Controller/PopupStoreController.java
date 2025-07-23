package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupStoreManagementService;
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
    private final PopupStoreManagementService popUpStoreManagementService;
    private final PopupStoreService popupStoreService;
    private final TokenUtils tokenUtils;


    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id,
                                                    @RequestHeader(value = "Authorization", required = false) String token,
                                                    HttpServletRequest request) {
        // 조회수 증가 처리
        popupStoreService.processViewCount(id, token, request);
        // 팝업 스토어 상세 정보 조회
        ResponseDto<?> result = popUpStoreManagementService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
