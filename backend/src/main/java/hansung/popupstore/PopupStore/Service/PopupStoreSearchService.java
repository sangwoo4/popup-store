package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.Util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;


@Service
@RequiredArgsConstructor
public class PopupStoreSearchService {

    private final PopUpStoreManagementService popUpRegisterService;
    private final PopUpStoreAiService popUpAiService;
    private final NaverSearchService naverSearchService;
    private final SearchDataProcessor searchDataProcessor;
    private final PopupStoreManager popupStoreManager;

    public ResponseDto<?> processSearch(String query) throws JsonProcessingException {
        String results = naverSearchService.fetchNaverSearch(query);
        List<String> queryResults = searchDataProcessor.getNewPopupStores(results); // 변경된 부분
        List<PopupStoreDto> allConvertedResults = new ArrayList<>();
        // 각 결과를 convertCategoryAPI 메서드에 전달하여 처리
        for (String queryResult : queryResults) {
            List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);
            allConvertedResults.addAll(convertResults);
        }
        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
        for (PopupStoreDto convertResult : allConvertedResults) {
            popUpRegisterService.createPopUp(convertResult);
        }
        return popupStoreManager.getAllPopupStores();
    }

    public ResponseDto<?> searchPopupStores(String searchQuery) throws JsonProcessingException {
        String results = naverSearchService.fetchNaverSearch(searchQuery);
        List<String> queryResults = searchDataProcessor.getNewPopupStores(results); // 변경된 부분
        List<PopupStoreDto> allConvertedResults = new ArrayList<>();
        // 첫 번째 검색어 결과를 처리
        for (String queryResult : queryResults) {
            List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);
            allConvertedResults.addAll(convertResults);
        }
        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
        for (PopupStoreDto convertResult : allConvertedResults) {
            popUpRegisterService.createPopUp(convertResult);
        }
        // 두 가지 검색어를 합쳐서 조회
        return popupStoreManager.getQueryPopupStores(searchQuery);
    }
}