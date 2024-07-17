package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.Account.Dto.ResponseDto;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup")
public class PopUpRegisterController {

    private PopUpRegisterService popUpRegisterService;

    // 팝업 스토어 등록
    @PostMapping("/register")
    public ResponseDto<?> submit(@RequestBody PopupStoreDto registerDto){
        ResponseDto<?> result = popUpRegisterService.createPopUp(registerDto);
        System.out.println(result);
        return result;
    }

    @PutMapping("/register/update/{id}")
    public ResponseDto<?>  update(@PathVariable("id") Long id, @RequestBody PopupStoreDto registerDto){
        ResponseDto<?> result = popUpRegisterService.updatePopUp(id, registerDto);
        return result;
    }

    @DeleteMapping("/register/update/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        popUpRegisterService.deleteRegister(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/detail/{id}")
    public ResponseDto<?> getDetail(@PathVariable("id") Long id){
        ResponseDto<?> result = popUpRegisterService.getDetail(id);
        return result;
    }

//    @GetMapping("/register/{id}")
//    public ResponseEntity<?> detail(@PathVariable("id") Long id) {
//        PopupStoreDto popupStoreDto = companyService.detail(id);
//        System.out.println("id====" + id);
//        return ResponseEntity.status(HttpStatus.OK).body(popupStoreDto);
//    }
}
