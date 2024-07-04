package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PopUpRegisterController {

    @Autowired
    private PopUpRegisterService companyService;
    @PostMapping("/register")
    public ResponseEntity<?> submit(@RequestBody PopupStoreDto companyDto){
        PopupStoreDto SaveCompanyDto = companyService.saveRegister(companyDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaveCompanyDto);
    }
}
