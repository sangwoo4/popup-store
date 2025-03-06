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

    private final NaverSearchService naverSearchService;
    private final SearchDataProcessor searchDataProcessor;
    private final PopupStoreManager popupStoreManager;
    private final PopupStoreProcessor popupStoreProcessor;

    public ResponseDto<?> processSearch(String query) throws JsonProcessingException {
        String jsonResult = naverSearchService.fetchNaverSearch(query);
        List<String> newStores = searchDataProcessor.getNewPopupStores(jsonResult);
        popupStoreProcessor.processAndSavePopupStores(newStores);
        return popupStoreManager.getAllPopupStores();
    }

    public ResponseDto<?> searchPopupStores(String searchQuery) throws JsonProcessingException {
        String results = naverSearchService.fetchNaverSearch(searchQuery);
        List<String> newStores = searchDataProcessor.getNewPopupStores(results); // 변경된 부분
        popupStoreProcessor.processAndSavePopupStores(newStores);
        return popupStoreManager.getQueryPopupStores(searchQuery);
    }
}