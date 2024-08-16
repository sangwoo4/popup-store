package hansung.popupstore.PopupStore;

import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.dto.PopupStoreResponseDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupImage;
import hansung.popupstore.model.PopupStore;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class PopupStoreMapper {

    public static PopupStoreResponseDto toDto(PopupStore popupStore) {
        // PopupImage DTO 생성
        List<PopupImageDto> popupImages = popupStore.getPopupImages().stream()
                .map(image -> new PopupImageDto(
                        image.getId(),
                        image.getImageUrl(),
                        image.getPopupStore() != null ? image.getPopupStore().getId() : null
                ))
                .collect(Collectors.toList());

        // Category DTO 생성
        List<CategoryDto> categories = popupStore.getCategories().stream()
                .map(category -> new CategoryDto(
                        category.getId(),
                        category.getCategory()
                ))
                .collect(Collectors.toList());

        // PopupStoreResponseDto 생성 및 반환
        return new PopupStoreResponseDto(
                popupStore.getId(),
                popupStore.getTitle(),
                categories,
                popupImages
        );
    }

    public static List<PopupStoreResponseDto> toDtoList(List<PopupStore> popupStores) {
        return popupStores.stream()
                .map(PopupStoreMapper::toDto)
                .collect(Collectors.toList());
    }
}