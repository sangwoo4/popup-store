package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.model.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

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

    public PopupStoreDto getPopupStoreDtoById(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found"));
        return convertToDto(popupStore);
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
                .postCode(dto.getPostCode())
                .detailAddress(dto.getDetailAddress())
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
        popupStore.setPostCode(dto.getPostCode());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
    }

    public PopupStoreDto convertToDto(PopupStore popupStore) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : popupStore.getStoreDays()) {
            storeDayDtos.add(StoreDayDto.builder()
                    .day(storeDay.getDay().getDay())
                    .openTime(storeDay.getOpenTime())
                    .closeTime(storeDay.getCloseTime())
                    .build());
        }

        String companyName = popupStore.getCompany().getCompanyName();

        Set<CategoryDto> categoryDtos = new HashSet<>();
        for (Category category : popupStore.getCategories()) {
            categoryDtos.add(CategoryDto.builder()
                    .category(category.getCategory())
                    .build());
        }

        Set<PopupImageDto> popupImageDtos = new HashSet<>();
        for (PopupImage popupImage : popupStore.getPopupImages()) {
            popupImageDtos.add(PopupImageDto.builder()
                    .id(popupImage.getId())
                    .imageUrl(popupImage.getImageUrl())
                    .build());
        }

        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .detailAddress(popupStore.getDetailAddress())
                .postCode(popupStore.getPostCode())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .telephone(popupStore.getTelephone())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .companyName(companyName)
                .categories(categoryDtos)
                .storeDays(storeDayDtos)
                .popupImages(popupImageDtos)
                .build();
    }
}