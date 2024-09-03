package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopUpStoreManagementService;
import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.Util.ResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/")
public class PopupStoreController {
    private final PopUpStoreManagementService popUpStoreManagementService;
    private final PopupStoreService popupStoreService;

    @GetMapping("/detail/{id}")
    public ResponseEntity<ResponseDto<?>> getDetail(@PathVariable("id") Long id) {
        popupStoreService.incrementViewCount(id);
        ResponseDto<?> result = popUpStoreManagementService.getDetail(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
