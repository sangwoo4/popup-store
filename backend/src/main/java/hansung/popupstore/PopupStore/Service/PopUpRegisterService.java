package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;


@Service
public class PopUpRegisterService {

    private final PopupStoreRepository popupStoreRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public PopUpRegisterService(PopupStoreRepository popupStoreRepository, CategoryRepository categoryRepository) {
        this.popupStoreRepository = popupStoreRepository;
        this.categoryRepository = categoryRepository;
    }

    // 팝업 스토어 등록
    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto popupStoreDto) {
        // DTO를 엔티티로 변환
        PopupStore popupStore = popupStoreDto.toEntity();

        // 카테고리 저장 및 업데이트
        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.getCategories().clear();
        popupStore.getCategories().addAll(savedCategories);

        PopupStore savedPopupStore = popupStoreRepository.save(popupStore);

        if (savedPopupStore == null) {
            throw new IllegalStateException("저장하기 실패");
        }

        return toDto(savedPopupStore);
    }

    // 팝업 스토어 수정
    @Transactional
    public PopupStoreDto updateRegister(Long id, PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        // DTO에서 엔티티로 데이터 업데이트
        popupStore.setTitle(popupStoreDto.getTitle());
        popupStore.setAddress(popupStoreDto.getAddress());
        popupStore.setRoadAddress(popupStoreDto.getRoadAddress());
        popupStore.setStartDate(popupStoreDto.getStartDate());
        popupStore.setEndDate(popupStoreDto.getEndDate());
        popupStore.setStartTime(popupStoreDto.getStartTime());
        popupStore.setEndTime(popupStoreDto.getEndTime());
        popupStore.setTelephone(popupStoreDto.getTelephone());
        popupStore.setSubway(popupStoreDto.getSubway());
        popupStore.setDescription(popupStoreDto.getDescription());
        popupStore.setLink(popupStoreDto.getLink());
        popupStore.setMapx(popupStoreDto.getMapx());
        popupStore.setMapy(popupStoreDto.getMapy());

        // 카테고리 업데이트 처리
        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.getCategories().clear();
        popupStore.getCategories().addAll(savedCategories);

        popupStoreRepository.save(popupStore);

        return toDto(popupStore);
    }

    // 팝업 스토어 조회
    @Transactional
    public PopupStoreDto getPost(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("팝업스토어가 존재하지 않습니다."));
        return toDto(popupStore);
    }

    // 팝업 스토어 삭제
    @Transactional
    public void deleteRegister(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        PopupStore popupStore = optionalPopupStore.orElseThrow(() ->
                new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        popupStoreRepository.deleteById(id);
    }

    // 카테고리 저장 및 삭제
    private Set<Category> saveOrUpdateCategories(Set<Category> categories) {
        Set<Category> savedCategories = new HashSet<>();
        for (Category category : categories) {
            Optional<Category> existingCategory = categoryRepository.findByName(category.getName());
            if (existingCategory.isPresent()) {
                savedCategories.add(existingCategory.get());
            } else {
                savedCategories.add(categoryRepository.save(category));
            }
        }
        return savedCategories;
    }
    // 엔티티를 DTO로 변환하는 메서드
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
}
