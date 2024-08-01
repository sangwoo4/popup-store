package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/popup")
public class PopUpRegisterController {

    private final PopUpRegisterService popUpRegisterService;
    private final TokenUtils tokenUtils;
    private final PopupStoreRepository popupStoreRepository;

    @PostMapping("/register")
    public ResponseEntity<ResponseDto<?>> submit(@RequestHeader("Authorization") String token,
                                                 @RequestBody PopupStoreDto registerDto) {
        String jwtToken = tokenUtils.extractToken(token);
        Long companyId = tokenUtils.extractCompanyIdFromToken(jwtToken);
        registerDto.setCompanyId(companyId);
        ResponseDto<?> result = popUpRegisterService.createPopUp(registerDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/register")
    public ResponseEntity<ResponseDto<?>> getRegisterPage() {
        ResponseDto<?> response = ResponseDto.setSuccess("페이지 접근이 허용되었습니다.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/register/update/{id}")
    public ResponseEntity<ResponseDto<?>> update(@PathVariable("id") Long id,
                                                 @RequestBody PopupStoreDto dto,
                                                 @RequestHeader("Authorization") String token) {
        String jwtToken = tokenUtils.extractToken(token);
        Long companyId = tokenUtils.extractCompanyIdFromToken(jwtToken);

        System.out.printf("dto get Id == %d\n", dto.getCompanyId());
        System.out.printf("companyId=========%d\n", companyId);

        // 토큰의 companyId와 데이터베이스의 companyId가 일치하는지 확인
        Optional<PopupStore> popupStoreOptional = popupStoreRepository.findById(id);
        if (!popupStoreOptional.isPresent()) {
            return new ResponseEntity<>(ResponseDto.setFailed("등록된 가게가 존재하지 않습니다."), HttpStatus.NOT_FOUND);
        }

        PopupStore popupStore = popupStoreOptional.get();
        System.out.printf("popupstore=====" + popupStore.getCompany().getCompanyId());

        if (!companyId.equals(popupStore.getCompany().getId())) {
            return new ResponseEntity<>(ResponseDto.setFailed("토큰의 회사 ID와 요청 데이터의 회사 ID가 일치하지 않습니다."), HttpStatus.FORBIDDEN);
        }

        ResponseDto<?> result = popUpRegisterService.updatePopUp(id, dto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    @DeleteMapping("/register/update/{id}")
    public ResponseEntity<ResponseDto<?>> delete(@PathVariable("id") Long id,
                                                 @RequestHeader("Authorization") String token) {
        String jwtToken = tokenUtils.extractToken(token);
        Long companyId = tokenUtils.extractCompanyIdFromToken(jwtToken);

        ResponseDto<?> result = popUpRegisterService.deleteRegister(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id) {
        ResponseDto<?> result = popUpRegisterService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}