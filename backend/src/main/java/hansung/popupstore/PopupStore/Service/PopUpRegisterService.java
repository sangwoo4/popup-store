package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Dto.PopUpStoreDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.PopupStore.Repository.StoreDayRepository;
import hansung.popupstore.model.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopUpRegisterService {
    private final PopupStoreRepository popupStoreRepository;
    private final CategoryRepository categoryRepository;
    private final StoreDayRepository storeDayRepository;
    private final DayRepository dayRepository;

    @Transactional
    public PopUpStoreDto saveRegister(PopUpStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreDto.toEntity();

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        PopupStore savedPopupStore = popupStoreRepository.save(popupStore);
        saveStoreDays(savedPopupStore, popupStoreDto.getStoreDays());
        return toDto(savedPopupStore);
    }

    @Transactional
    public PopUpStoreDto updateRegister(Long id, PopUpStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        updatePopupStoreFromDto(popupStore, popupStoreDto);

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        popupStoreRepository.save(popupStore);
        // 기존의 StoreDays 삭제 후 새로운 StoreDays 추가
        //storeDayRepository.deleteByPopupStore(popupStore);
        saveStoreDays(popupStore, popupStoreDto.getStoreDays());

        return toDto(popupStore);
    }

    @Transactional
    public PopUpStoreDto getPost(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("팝업스토어가 존재하지 않습니다."));
        return toDto(popupStore);
    }

    @Transactional
    public void deleteRegister(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        popupStoreRepository.deleteById(id);
    }

    private Set<Category> saveOrUpdateCategories(Set<Category> categories) {
        Set<Category> savedCategories = new HashSet<>();
        for (Category category : categories) {
            Optional<Category> existingCategory = categoryRepository.findByName(category.getName());
            savedCategories.add(existingCategory.orElseGet(() -> categoryRepository.save(category)));
        }
        return savedCategories;
    }

    private void saveStoreDays(PopupStore popupStore, Set<StoreDayDto> storeDayDtos) {
        if (storeDayDtos == null) {
            return; // storeDayDtos가 null인 경우 처리
        }
        for (StoreDayDto storeDayDto : storeDayDtos) {
            Day day = dayRepository.findById(storeDayDto.getCode())
                    .orElseThrow(() -> new IllegalStateException("해당 요일이 존재하지 않습니다."));
            StoreDay storeDay = StoreDay.builder()
                    .popupStore(popupStore)
                    .day(day)
                    .startTime(storeDayDto.getStartTime())
                    .endTime(storeDayDto.getEndTime())
                    .build();
            storeDayRepository.save(storeDay);
        }
    }

    private PopUpStoreDto toDto(PopupStore popupStore) {
        return PopUpStoreDto.builder()
                .id(popupStore.getId())
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
                .storeDays(toStoreDayDtos(popupStore.getStoreDays()))
                .build();
    }

    private Set<StoreDayDto> toStoreDayDtos(Set<StoreDay> storeDays) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : storeDays) {
            StoreDayDto dto = StoreDayDto.builder()
                    .code(storeDay.getDay().getCode())
                    .startTime(storeDay.getStartTime())
                    .endTime(storeDay.getEndTime())
                    .build();
            storeDayDtos.add(dto);
        }
        return storeDayDtos;
    }

    private void updatePopupStoreFromDto(PopupStore popupStore, PopUpStoreDto dto) {
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