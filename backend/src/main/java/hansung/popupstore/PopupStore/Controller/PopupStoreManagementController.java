package hansung.popupstore.PopupStore.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpStoreManagementService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("popup/company")
public class PopupStoreManagementController {

    private final PopUpStoreManagementService popUpStoreManagementService;
    private final TokenUtils tokenUtils;
    private final PopupStoreRepository popupStoreRepository;

    @PostMapping("/register")
    public ResponseEntity<ResponseDto<?>> create(
            @RequestHeader("Authorization") String token,
            @RequestPart(value = "dto") PopupStoreDto dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        String jwtToken = tokenUtils.extractToken(token);
        Long companyId = tokenUtils.extractCompanyIdFromToken(jwtToken);
        dto.setCompanyId(companyId);
        ResponseDto<?> result = popUpStoreManagementService.registerPopUpWithImage(dto, images);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/register")
    public ResponseEntity<ResponseDto<?>> getRegisterPage() {
        ResponseDto<?> response = ResponseDto.setSuccess("페이지 접근이 허용되었습니다.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseDto<?>> update(@PathVariable("id") Long id,
                                                 @RequestHeader("Authorization") String token,
                                                 @RequestPart(value = "dto") PopupStoreDto dto,
                                                 @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        String jwtToken = tokenUtils.extractToken(token);
        Long companyId = tokenUtils.extractCompanyIdFromToken(jwtToken);

        Optional<PopupStore> popupStoreOptional = popupStoreRepository.findById(id);
        if (!popupStoreOptional.isPresent()) {
            return new ResponseEntity<>(ResponseDto.setFailed("등록된 가게가 존재하지 않습니다."), HttpStatus.NOT_FOUND);
        }
        PopupStore popupStore = popupStoreOptional.get();
        if (!companyId.equals(popupStore.getCompany().getId())) {
            return new ResponseEntity<>(ResponseDto.setFailed("토큰의 회사 ID와 요청 데이터의 회사 ID가 일치하지 않습니다."), HttpStatus.FORBIDDEN);
        }

        ResponseDto<?> result = popUpStoreManagementService.updatePopUp(id, dto, images);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto<?>> delete(@PathVariable("id") Long id,
                                                 @RequestHeader("Authorization") String token) {
        ResponseDto<?> result = popUpStoreManagementService.deleteRegister(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id) {
        ResponseDto<?> result = popUpStoreManagementService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}