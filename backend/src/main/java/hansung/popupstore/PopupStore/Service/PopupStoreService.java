package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.Company;
import hansung.popupstore.Account.Repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PopupStoreService {
    private final PopupStoreRepository popupStoreRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public PopupStore createPopupStore(PopupStoreDto dto) {
        PopupStore popupStore = buildPopupStoreEntity(dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
    }

    @Transactional
    public PopupStore updatePopupStore(Long id, PopupStoreDto dto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
        updatePopupStoreEntity(popupStore, dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
    }

    @Transactional(readOnly = true)
    public PopupStore getPopupStore(Long id) {
        return popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
    }

    @Transactional
    public void deletePopupStore(Long id) {
        popupStoreRepository.deleteById(id);
    }

    private PopupStore buildPopupStoreEntity(PopupStoreDto dto) {
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));
        }

        return PopupStore.builder()
                .title(dto.getTitle())
                .address(dto.getAddress())
                .roadAddress(dto.getRoadAddress())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .telephone(dto.getTelephone())
                .subway(dto.getSubway())
                .description(dto.getDescription())
                .link(dto.getLink())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .company(company)
                .build();
    }

    void updatePopupStoreEntity(PopupStore popupStore, PopupStoreDto dto) {
        popupStore.setTitle(dto.getTitle());
        popupStore.setAddress(dto.getAddress());
        popupStore.setRoadAddress(dto.getRoadAddress());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
    }
}