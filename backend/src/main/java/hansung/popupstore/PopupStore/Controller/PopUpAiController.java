package hansung.popupstore.PopupStore.Controller;


import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpAiService;
import hansung.popupstore.Util.ResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/ai")
public class PopUpAiController {

    private final PopUpAiService popUpAiService;
    @PostMapping("/category")
    public String update(@RequestBody String request) {
        System.out.println("request =========" + request);
        String result = popUpAiService.sendRequestToApi(request);
        System.out.println("result =============================!!!!!!!!!!!!!!!!!" + result);
        return result;
    }

}
