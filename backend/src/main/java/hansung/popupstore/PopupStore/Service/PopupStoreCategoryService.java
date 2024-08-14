package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupStoreCategoryService {
    private final CategoryRepository categoryRepository;

    public Set<Category> saveOrUpdatePopUpCategories(Set<CategoryDto> categoryDtos, PopupStore popupStore) {
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
        return savedCategories;
    }

}