package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.PopupStore.Service.PopUpStoreManagementService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/user")
public class PopupStoreUserController {

    private final PopUpStoreManagementService popUpRegisterService;

    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id) {
        ResponseDto<?> result = popUpRegisterService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}