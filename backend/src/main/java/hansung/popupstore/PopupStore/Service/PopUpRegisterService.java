package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.PopupStore.Repository.StoreDayRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopUpRegisterService {
    private final PopupStoreRepository popupStoreRepository;
    private final CategoryRepository categoryRepository;
    private final DayRepository dayRepository;
    private final StoreDayRepository storeDayRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ResponseDto<?> createPopUp(PopupStoreDto dto) {
        // Create PopupStore entity
        PopupStore popupStore = buildPopupStoreEntity(dto);

        // Save PopupStore entity
        popupStoreRepository.save(popupStore);

        // Save or update StoreDays
        saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);

        // Save or update Categories
        saveOrUpdateCategories(dto.getCategories(), popupStore);

        return ResponseDto.setSuccess("PopupStore created successfully.");
    }

    @Transactional
    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            PopupStore popupStore = optionalPopupStore.get();

            // Update PopupStore entity
            updatePopupStoreEntity(popupStore, dto);

            // Update categories
            saveOrUpdateCategories(dto.getCategories(), popupStore);

            // Update StoreDays
            saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);

            // Save updated PopupStore entity
            popupStoreRepository.save(popupStore);

            return ResponseDto.setSuccess("PopupStore updated successfully.");
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    @Transactional(readOnly = true)
    public ResponseDto<?> getDetail(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            PopupStore popupStore = optionalPopupStore.get();
            PopupStoreDto popupStoreDto = convertToDto(popupStore);
            return ResponseDto.setSuccessData("Success", popupStoreDto);
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    @Transactional
    public ResponseDto<?> deleteRegister(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            popupStoreRepository.deleteById(id);
            return ResponseDto.setSuccess("PopupStore deleted successfully.");
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    private PopupStore buildPopupStoreEntity(PopupStoreDto dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("회사를 찾을 수 없습니다. ID: " + dto.getCompanyId()));
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
                .company(company) // 회사 정보 설정
                .build();
    }


    private void saveOrUpdateCategories(Set<CategoryDto> categoryDtos, PopupStore popupStore) {
        Set<Category> savedCategories = new HashSet<>();
        for (CategoryDto categoryDto : categoryDtos) {
            if (categoryDto.getCategory() == null) {
                System.out.println("Category name is null: " + categoryDto);
                continue;
            }
            Optional<Category> existingCategory = categoryRepository.findByCategory(categoryDto.getCategory());
            if (existingCategory.isPresent()) {
                savedCategories.add(existingCategory.get());
            } else {
                System.out.println("Category not found: " + categoryDto.getCategory());
            }
        }
        popupStore.setCategories(savedCategories);
    }

    private void saveOrUpdateStoreDays(Set<StoreDayDto> storeDayDtos, PopupStore popupStore) {
        for (StoreDayDto storeDayDto : storeDayDtos) {
            // Day 엔티티 설정
            Day day = dayRepository.findByDay(storeDayDto.getDay())
                    .orElseGet(() -> {
                        Day newDay = new Day();
                        newDay.setDay(storeDayDto.getDay());
                        return dayRepository.save(newDay);
                    });

            // StoreDay 엔티티 설정
            StoreDay storeDay = new StoreDay();
            storeDay.setDay(day);
            storeDay.setPopupStore(popupStore);
            storeDay.setOpenTime(storeDayDto.getOpenTime());
            storeDay.setCloseTime(storeDayDto.getCloseTime());

            // StoreDayId 설정
            StoreDayId storeDayId = new StoreDayId(popupStore.getId(), day.getId());
            storeDay.setId(storeDayId);

            // StoreDay 엔티티 저장
            storeDayRepository.save(storeDay);
        }
    }

    private void updatePopupStoreEntity(PopupStore popupStore, PopupStoreDto dto) {
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

    private PopupStoreDto convertToDto(PopupStore popupStore) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : popupStore.getStoreDays()) {
            storeDayDtos.add(StoreDayDto.builder()
                    .day(storeDay.getDay().getDay())
                    .openTime(storeDay.getOpenTime())
                    .closeTime(storeDay.getCloseTime())
                    .build());
        }

        Set<CategoryDto> categoryDtos = new HashSet<>();
        for (Category category : popupStore.getCategories()) {
            categoryDtos.add(CategoryDto.builder()
                    .category(category.getCategory())
                    .build());
        }

        return PopupStoreDto.builder()
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .roadAddress(popupStore.getRoadAddress())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .telephone(popupStore.getTelephone())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .categories(categoryDtos)
                .storeDays(storeDayDtos)
                .build();
    }
}