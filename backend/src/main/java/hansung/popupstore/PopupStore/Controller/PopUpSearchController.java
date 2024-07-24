package hansung.popupstore.PopupStore.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
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


    @GetMapping("/all")
    public ResponseEntity<ResponseDto<?>> savePopUp() throws JsonProcessingException {
        ResponseDto<?> result = popupSearchService.processPopUpSearch("팝업스토어");
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<?>> searchPopUp2(@RequestParam("query") String query) throws JsonProcessingException {
        String searchQuery = "팝업" + query;
        ResponseDto<?> result = popupSearchService.searchPopupStores(searchQuery);
        return new ResponseEntity<>(result, HttpStatus.OK);

    }
}