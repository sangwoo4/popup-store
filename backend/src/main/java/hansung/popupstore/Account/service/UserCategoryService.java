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
public class UserCategoryService {
    private final CategoryRepository categoryRepository;
    public Set<Category> saveOrUpdateUserCategories(Set<CategoryDto> categoryDtos) {
        Set<Category> savedCategories = new HashSet<>();
        for (CategoryDto categoryDto : categoryDtos) {
            Optional<Category> existingCategory = categoryRepository.findByCategory(categoryDto.getCategory());
            existingCategory.ifPresent(savedCategories::add);
        }
        return savedCategories;
    }

    public ResponseDto<List<Category>> getAllCategories() {
        List<Category> allCategories = categoryRepository.findAll();
        return ResponseDto.setSuccessData("카테고리 조회 성공", allCategories);
    }
}