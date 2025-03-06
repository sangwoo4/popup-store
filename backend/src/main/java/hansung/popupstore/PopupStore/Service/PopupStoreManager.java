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
    // 팝업 스토어의 모든 항목을 조회
//    public ResponseDto<?> getAllPopupStores() {
//        List<PopupStore> allPopupStores = popupStoreRepository.findAll();
//        List<PopupStoreResponseDto> popupStoreDtos = PopupStoreMapper.toDtoList(allPopupStores);
//        return ResponseDto.setSuccessData("팝업 스토어 조회 성공", popupStoreDtos);
//    }
//
//    // 쿼리에 맞는 팝업 스토어를 조회
//    public ResponseDto<?> getQueryPopupStores(String query) {
//        String removePopup = query.replace("팝업", "").trim(); // 문자열 앞뒤 공백 제거
//
//        // 제목에 쿼리 문자열이 포함된 팝업 스토어를 조회
//        List<PopupStore> popupStores = popupStoreRepository.findByTitleContaining(removePopup);
//        List<PopupStoreResponseDto> popupStoreDtos = PopupStoreMapper.toDtoList(popupStores);
//
//        // 결과가 없을 경우
//        if (popupStores.isEmpty()) {
//            return ResponseDto.setFailedData("팝업 스토어 조회 성공, 결과가 없습니다.", Collections.emptyList());
//        }
//        // 결과가 있을 경우
//        return ResponseDto.setSuccessData("팝업 스토어 조회 성공", popupStoreDtos);
//    }
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
