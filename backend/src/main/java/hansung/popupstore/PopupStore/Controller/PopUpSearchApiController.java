package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/search/popup")
public class PopUpSearchApiController {

    private PopupStoreService popupStoreService;

    @GetMapping("/all")
    public List<PopupStore> savePopUp() {
        String query = "팝업";
        String result = popupStoreService.fetchNaverSearchResults(query);
        popupStoreService.getNewPopupStores(result);
        return popupStoreService.getAllPopupStores();
    }

//    @GetMapping("/all")
//    public List<PopupStore> testPopUp() {
//        String query = "팝업";
//        String result = popupStoreService.fetchNaverSearchResults(query);
//        popupStoreService.savePopupStores(result);
//        return popupStoreService.getAllPopupStores();
//    }

//    @GetMapping
//    public Optional<PopupStore> searchPopUp(@RequestParam("query") String query){
//        String naverSearch = "팝업 " + query;
//        System.out.println(naverSearch);
//        String result = popupStoreService.fetchNaverSearchResults(naverSearch);
//
//        popupStoreService.savePopupStores(result);
//        return popupStoreService.searchPopupStores(query);
//
//    }
}