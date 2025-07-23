package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.PopupStoreResponseDto;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PopupStoreManager {
    private final PopupStoreRepository popupStoreRepository;

    public ResponseDto<?> getAllPopupStores() {
        List<PopupStore> allPopupStores = popupStoreRepository.findAll();
        List<PopupStoreResponseDto> popupStoreDtos = PopupStoreMapper.toDtoList(allPopupStores);
        return ResponseDto.setSuccessData("팝업 스토어 조회 성공", popupStoreDtos);
    }

    public ResponseDto<?> getQueryPopupStores(String query) {
        String removePopup = query.contains("팝업") ? query.replace("팝업", "").trim() : query;
        List<PopupStore> popupStores = popupStoreRepository.findByTitleContaining(removePopup);
        return popupStores.isEmpty() ?
                ResponseDto.setFailedData("팝업 스토어 조회 성공, 결과가 없습니다.", Collections.emptyList()) :
                ResponseDto.setSuccessData("팝업 스토어 조회 성공", PopupStoreMapper.toDtoList(popupStores));
    }
}
