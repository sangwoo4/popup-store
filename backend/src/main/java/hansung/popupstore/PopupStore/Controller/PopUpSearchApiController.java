package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Service.PopUpAiService;
import hansung.popupstore.PopupStore.Service.PopUpRegisterService;
import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.ResponseDto;
import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/search/popup")
public class PopUpSearchApiController {

    private final PopupStoreService popupStoreService;
    private final PopUpAiService popUpAiService;
    private final PopUpRegisterService popUpRegisterService;

//    public List<PopupStore> savePopUp() {
//        String query = "팝업";
//        String queryResult = popupStoreService.getNewPopupStores(query);
//        String convertResult = popUpAiService.convertCategoryAPI(queryResult);
//        return popupStoreService.getAllPopupStores();
//    }
    @GetMapping("/all")
    public ResponseEntity<ResponseDto<?>> savePopUp(){
        String query = "팝업";

        String results = popupStoreService.fetchNaverSearchResults(query);
        String queryResult = popupStoreService.getNewPopupStores(results);
        System.out.println("queryResult ============= "+ queryResult );
        PopupStoreDto convertResult = popUpAiService.convertCategoryAPI(queryResult);
        ResponseDto<?> result = popUpRegisterService.createPopUp(convertResult);
        return new ResponseEntity<>(result, HttpStatus.OK);
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