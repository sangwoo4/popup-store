package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.ResponseDto;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
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

    // 팝업 스토어 등록
    @PostMapping("/register")
    public ResponseEntity<ResponseDto<?>> submit(@RequestBody PopupStoreDto registerDto) {
        ResponseDto<?> result = popUpRegisterService.createPopUp(registerDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
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