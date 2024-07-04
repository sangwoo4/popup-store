package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PopUpRegisterService {

    @Autowired
    private PopupStoreRepository popupStoreRepository;

    // 팝업 스토어 등록
    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto companyDto) {
        PopupStore popupStore = popupStoreRepository.save(companyDto.toEntity());

        if (popupStore == null) {
            throw new IllegalStateException("저장하기 실패");
        }
        return PopupStoreDto.fromEntity(popupStore);
    }

    // 팝업 스토어 수정
    @Transactional
    public PopupStoreDto updateRegister(Long id, PopupStoreDto registerDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        popupStore.updateFromDto(registerDto);
        popupStoreRepository.save(popupStore);

        return PopupStoreDto.fromEntity(popupStore);
    }

    // 팝업 스토어 조회
    @Transactional
    public PopupStoreDto getPost(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        PopupStore popupStore = optionalPopupStore.orElseThrow(() ->
                new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        return PopupStoreDto.fromEntity(popupStore);
    }

    @Transactional
    public void deleteRegister(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        PopupStore popupStore = optionalPopupStore.orElseThrow(() ->
                new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        popupStoreRepository.deleteById(id);
    }
}
