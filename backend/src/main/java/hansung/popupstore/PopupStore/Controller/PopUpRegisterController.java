package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup")
public class PopUpRegisterController {

    private final PopUpRegisterService popUpRegisterService;
    private final TokenProvider tokenProvider;
    // 팝업 스토어 등록
    @PostMapping("/register")
    public ResponseEntity<ResponseDto<?>> submit(@RequestHeader("Authorization") String token,
                                                 @RequestBody PopupStoreDto registerDto) {
        System.out.println("token: " + token);

        // Authorization 헤더에서 Bearer를 제거하고 토큰만 추출
        String jwtToken = token.replace("Bearer ", "");

        Long companyId = extractCompanyIdFromToken(jwtToken);
        System.out.println("Extracted companyId: " + companyId);

        registerDto.setCompanyId(companyId);
        ResponseDto<?> result = popUpRegisterService.createPopUp(registerDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Token에서 companyId를 추출하는 메서드
    private Long extractCompanyIdFromToken(String token) {
        String companyIdStr = tokenProvider.validateJwt(token);
        System.out.println("companyIdStr: " + companyIdStr);
        if (companyIdStr == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        return Long.parseLong(companyIdStr);
    }

    @GetMapping("/register")
    public ResponseEntity<ResponseDto<?>> getRegisterPage() {
        ResponseDto<?> response = ResponseDto.setSuccess("페이지 접근이 허용되었습니다.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/register/update/{id}")
    public ResponseEntity<ResponseDto<?>> update(@PathVariable("id") Long id, @RequestBody PopupStoreDto registerDto) {
        ResponseDto<?> result = popUpRegisterService.updatePopUp(id, registerDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @DeleteMapping("/register/update/{id}")
    public ResponseEntity<ResponseDto<?>> delete(@PathVariable("id") Long id) {
        ResponseDto<?> result = popUpRegisterService.deleteRegister(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id) {
        ResponseDto<?> result = popUpRegisterService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}