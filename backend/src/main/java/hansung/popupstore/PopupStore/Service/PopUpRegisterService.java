package hansung.popupstore.PopupStore.Service;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupStore;
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


    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreDto.toEntity();

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        PopupStore savedPopupStore = popupStoreRepository.save(popupStore);
        return toDto(savedPopupStore);
    }

    @Transactional
    public PopupStoreDto updateRegister(Long id, PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        updatePopupStoreFromDto(popupStore, popupStoreDto);

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        popupStoreRepository.save(popupStore);
        return toDto(popupStore);
    }

    @Transactional
    public PopupStoreDto getPost(Long id) {
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

    private PopupStoreDto toDto(PopupStore popupStore) {
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
                .categories(popupStore.getCategories())
                .build();
    }

    private void updatePopupStoreFromDto(PopupStore popupStore, PopupStoreDto dto) {
        popupStore.setTitle(dto.getTitle());
        popupStore.setAddress(dto.getAddress());
        popupStore.setRoadAddress(dto.getRoadAddress());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setStartTime(dto.getStartTime());
        popupStore.setEndTime(dto.getEndTime());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
    }
}