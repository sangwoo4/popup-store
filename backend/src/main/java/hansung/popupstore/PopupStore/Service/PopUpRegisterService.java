package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.PopupStoreDto;
import hansung.popupstore.PopupStore.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PopUpRegisterService {

    @Autowired
    private PopupStoreRepository popup_store_repository;

    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto companyDto) {
        PopupStore popup_store = popup_store_repository.save(companyDto.toEntity());

        if(popup_store == null){
            throw new IllegalStateException("저장하기 실패");
        }
        return PopupStoreDto.builder()
                .id(popup_store.getId())
                .title(popup_store.getTitle())
                .address(popup_store.getAddress())
                .roadAddress(popup_store.getRoadAddress())
                .startDate(popup_store.getStartDate())
                .endDate(popup_store.getEndDate())
                .startTime(popup_store.getStartTime())
                .endTime(popup_store.getEndTime())
                .telephone(popup_store.getTelephone())
                .subway(popup_store.getSubway())
                .description(popup_store.getDescription())
                .link(popup_store.getLink())
                .mapx(popup_store.getMapx())
                .mapy(popup_store.getMapy())
                .build();
    }
}
