package hansung.popupstore.PopupStore.Controller;


import hansung.popupstore.PopupStore.Service.PopUpStoreAiService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/ai")
public class PopUpStoreAiController {

    private final PopUpStoreAiService popUpAiService;
    @PostMapping("/category")
    public String update(@RequestBody String request) {
        System.out.println("request =========" + request);
        String result = popUpAiService.sendRequestToApi(request);
        return result;
    }

}
