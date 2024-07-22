package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Service.PopupSearchService;
import hansung.popupstore.Util.ResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/search/popup")
public class PopUpSearchController {

    private final PopupSearchService popupSearchService;
//    @GetMapping("/all")
//    public ResponseEntity<ResponseDto<?>> savePopUp() {
//        String query = "팝업";
//
//        String results = popupStoreService.fetchNaverSearchResults(query);
//        String queryResult = popupStoreService.getNewPopupStores(results);
//
//        // convertCategoryAPI 메서드가 리스트를 반환하므로 이를 처리합니다.
//        List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);
//
//        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
//        for (PopupStoreDto convertResult : convertResults) {
//            popUpRegisterService.createPopUp(convertResult);
//        }
//        popupStoreService.getAllPopupStores();
//        return new ResponseEntity<>(HttpStatus.OK);
//    }
//    @GetMapping
//    public ResponseEntity<ResponseDto<?>> searchPopUp(@RequestParam("query") String query){
//        String searchQuery = "팝업" + query;
//        String results = popupStoreService.fetchNaverSearchResults(searchQuery);
//        String queryResult = popupStoreService.getNewPopupStores(results);
//
//        // convertCategoryAPI 메서드가 리스트를 반환하므로 이를 처리합니다.
//        List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);
//
//        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
//        for (PopupStoreDto convertResult : convertResults) {
//            popUpRegisterService.createPopUp(convertResult);
//        }
//        popupStoreService.searchPopupStores(searchQuery);
//        return new ResponseEntity<>(HttpStatus.OK);
//
//    }

    @GetMapping("/all")
    public ResponseEntity<ResponseDto<?>> savePopUp() {
        ResponseDto<?> result = popupSearchService.processPopUpSearch("팝업");
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<?>> searchPopUp(@RequestParam("query") String query) {
        String searchQuery = "팝업" + query;
        ResponseDto<?> result = popupSearchService.searchPopupStores(searchQuery);
        return new ResponseEntity<>(result, HttpStatus.OK);

    }
}