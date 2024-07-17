package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Dto.ResponseDto;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Dto.StoreDayDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.PopupStore.Repository.StoreDayRepository;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.Day;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.StoreDay;
import hansung.popupstore.model.StoreDayId;
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
    @Transactional
    public ResponseDto<?> createPopUp(PopupStoreDto dto) {
        Set<Category> categories = dto.getCategories() != null ? saveOrUpdateCategories(dto.getCategories()) : new HashSet<>();
        PopupStore popupStore = PopupStore.builder()
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
                .categories(categories)
                .build();


        popupStoreRepository.save(popupStore);
        saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        return ResponseDto.setSuccess("Success.");
    }


    @Transactional
    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            PopupStore popupStore = optionalPopupStore.get();

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

            // Update categories
            Set<Category> categories = dto.getCategories() != null ? saveOrUpdateCategories(dto.getCategories()) : new HashSet<>();
            popupStore.setCategories(categories);

            // Update storeDays
            Set<StoreDay> storeDays = saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
            popupStore.getStoreDays().clear();
            popupStore.getStoreDays().addAll(storeDays);

            popupStoreRepository.save(popupStore);
            convertToDto(popupStore);
            return ResponseDto.setSuccess("Updated successfully.");
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    @Transactional
    public void deleteRegister(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        popupStoreRepository.deleteById(id);
    }


    @Transactional(readOnly = true)
    public ResponseDto<?> getDetail(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);

        PopupStore popupStore = optionalPopupStore.get();

        // Convert the PopupStore entity to a DTO to avoid serialization issues with Hibernate proxies
        PopupStoreDto popupStoreDto = convertToDto(popupStore);

        return ResponseDto.setSuccessData("Success", popupStoreDto);
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
                .categories(popupStore.getCategories())
                .storeDays(storeDayDtos)
                .build();
    }

    private Set<Category> saveOrUpdateCategories(Set<Category> categories) {
        Set<Category> savedCategories = new HashSet<>();
        for (Category category : categories) {
            Category savedCategory = categoryRepository.findByName(category.getName())
                    .orElseGet(() -> categoryRepository.save(category));
            savedCategories.add(savedCategory);
        }
        return savedCategories;
    }

    public Set<StoreDay> saveOrUpdateStoreDays(Set<StoreDayDto> storeDayDtos, PopupStore popupStore) {
        Set<StoreDay> savedStoreDays = new HashSet<>();

        for (StoreDayDto storeDayDto : storeDayDtos) {
            // 새로운 StoreDay 엔티티 생성
            StoreDay storeDay = new StoreDay();

            // Day 엔티티 설정
            Day day = dayRepository.findByDay(storeDayDto.getDay())
                    .orElseGet(() -> {
                        Day newDay = new Day();
                        newDay.setDay(storeDayDto.getDay());
                        return dayRepository.save(newDay);
                    });
            storeDay.setDay(day);

            // StoreDayId 설정
            StoreDayId storeDayId = new StoreDayId(popupStore.getId(), day.getId());
            storeDay.setId(storeDayId);

            // PopupStore 설정
            storeDay.setPopupStore(popupStore);

            // openTime 및 closeTime 설정
            storeDay.setOpenTime(storeDayDto.getOpenTime());
            storeDay.setCloseTime(storeDayDto.getCloseTime());

            // StoreDay 엔티티 저장
            savedStoreDays.add(storeDayRepository.save(storeDay));
        }

        return savedStoreDays;
    }
}