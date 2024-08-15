package hansung.popupstore.PopupStore;

import hansung.popupstore.dto.PopupStoreResponseDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupImage;
import hansung.popupstore.model.PopupStore;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class PopupStoreMapper {

    public static PopupStoreResponseDto toDto(PopupStore popupStore) {
        List<String> popupImages = popupStore.getPopupImages().stream()
                .map(PopupImage::getImageUrl) // PopupImage 엔티티에서 URL 가져오기
                .collect(Collectors.toList());
        List<String> categories = popupStore.getCategories().stream()
                .map(Category::getCategory)
                .collect(Collectors.toList());

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