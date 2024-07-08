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

    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreDto.toEntity();

        // 카테고리 설정 및 저장
        Set<Category> savedCategories = new HashSet<>();
        for (Category category : popupStoreDto.getCategories()) {
            Optional<Category> existingCategory = categoryRepository.findByName(category.getName());
            if (existingCategory.isPresent()) {
                savedCategories.add(existingCategory.get());
            } else {
                // Category가 존재하지 않으면 새로 저장
                savedCategories.add(categoryRepository.save(category));
            }
        }
        popupStore.setCategories(savedCategories);

        PopupStore savedPopupStore = popupStoreRepository.save(popupStore);

        if (savedPopupStore == null) {
            throw new IllegalStateException("저장하기 실패");
        }

        return popupStoreDto.toDto(savedPopupStore);
    }

    @Transactional
    public PopupStoreDto updateRegister(Long id, PopupStoreDto popupStoreDto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("수정 실패"));

        popupStore.updateFromDto(popupStoreDto);

        // 카테고리 설정 및 저장
        Set<Category> savedCategories = new HashSet<>();
        for (Category category : popupStoreDto.getCategories()) {
            Optional<Category> existingCategory = categoryRepository.findByName(category.getName());
            if (existingCategory.isPresent()) {
                savedCategories.add(existingCategory.get());
            } else {
                // Category가 존재하지 않으면 새로 저장
                savedCategories.add(categoryRepository.save(category));
            }
        }
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

    @Transactional
    public void deleteRegister(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        PopupStore popupStore = optionalPopupStore.orElseThrow(() ->
                new IllegalStateException("존재하지 않는 팝업 스토어입니다."));
        popupStoreRepository.deleteById(id);
    }
}
