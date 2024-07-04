package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/search/popup")
public class PopUpSearchApiController {

    private PopupStoreService naverService;

    @GetMapping("/AllPopup")
    public List<PopupStore> savePopUp() {
        String query = "팝업";
        String result = naverService.fetchNaverSearchResults(query);
        naverService.savePopupStores(result);
        return naverService.getAllPopupStores();
    }

    @GetMapping
    public Optional<PopupStore> searchPopUp(@RequestParam("query") String query){
        String naverSearch = "팝업 " + query;
        System.out.println(naverSearch);
        String result = naverService.fetchNaverSearchResults(naverSearch);

        naverService.savePopupStores(result);
        return naverService.searchPopupStores(query);

    }
}