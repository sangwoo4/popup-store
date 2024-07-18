package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/search/popup")
public class PopUpSearchApiController {

    private PopupStoreService naverService;

    @GetMapping("/all")
    public List<PopupStore> savePopUp() {
        String query = "팝업";
        String result = naverService.fetchNaverSearchResults(query);
        naverService.getNewPopupStores(result);
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