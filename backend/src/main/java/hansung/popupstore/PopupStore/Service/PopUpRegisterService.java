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
        PopupStore popupStore = popupStoreDto.toEntity();

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        PopupStore savedPopupStore = popupStoreRepository.save(popupStore);

        if (savedPopupStore == null) {
            throw new IllegalStateException("저장하기 실패");
        }

        return popupStoreDto.toDto(savedPopupStore);
    }

    // 팝업 스토어 수정
    @Transactional
    public PopupStoreDto updateRegister(Long id, PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        popupStore.updateFromDto(popupStoreDto);

        Set<Category> savedCategories = saveOrUpdateCategories(popupStoreDto.getCategories());
        popupStore.setCategories(savedCategories);

        popupStoreRepository.save(popupStore);

        return popupStoreDto.toDto(popupStore);
    }

    // 팝업 스토어 조회
    @Transactional
    public PopupStoreDto getPost(Long id, PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("팝업스토어가 존재하지 않습니다."));
        return popupStoreDto.toDto(popupStore);
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
}
