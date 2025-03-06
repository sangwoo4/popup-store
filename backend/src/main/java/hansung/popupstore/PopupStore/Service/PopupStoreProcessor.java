package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PopupStoreProcessor {


    private final PopUpStoreAiService popUpAiService;
    private final PopupStoreManagementService popupStoreManagementService;

    @Transactional
    public void processAndSavePopupStores(List<String> newStores) throws JsonProcessingException {
        List<PopupStoreDto> allConvertedResults = new ArrayList<>();

        for (String queryResult : newStores) {
            List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);
            allConvertedResults.addAll(convertResults);
        }

        for (PopupStoreDto convertResult : allConvertedResults) {
            popupStoreManagementService.createPopUp(convertResult);
        }
    }
}
