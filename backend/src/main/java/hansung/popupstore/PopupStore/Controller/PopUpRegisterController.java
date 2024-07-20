package hansung.popupstore.PopupStore.Controller;


import hansung.popupstore.PopupStore.Dto.PopUpStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup")
public class PopUpRegisterController {

    private PopUpRegisterService companyService;

    // 팝업 스토어 등록
    @PostMapping("/register")
    public ResponseEntity<?> submit(@RequestBody PopUpStoreDto registerDto){
        PopUpStoreDto SaveRegisterDto = companyService.saveRegister(registerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaveRegisterDto);
    }
    // 팝업 스토어 수정
    @PutMapping("/register/update/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody PopUpStoreDto registerDto){
        PopUpStoreDto updatedDto = companyService.updateRegister(id, registerDto);
        return new ResponseEntity<>(updatedDto, HttpStatus.OK);
    }

    @DeleteMapping("/register/update/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        companyService.deleteRegister(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/register/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") Long id){
        PopUpStoreDto popupStoreDto = companyService.getPost(id);
        return ResponseEntity.status(HttpStatus.OK).body(popupStoreDto);
    }
}
