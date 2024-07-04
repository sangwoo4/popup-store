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
    private PopupStoreRepository popupStoreRepository;

    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto companyDto) {
        PopupStore popupStore = popupStoreRepository.save(companyDto.toEntity());

        if(popupStore == null){
            throw new IllegalStateException("저장하기 실패");
        }
        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .roadAddress(popupStore.getRoadAddress())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .startTime(popupStore.getStartTime())
                .endTime(popupStore.getEndTime())
                .telephone(popupStore.getTelephone())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .build();
    }
}
