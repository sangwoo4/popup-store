package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.dto.*;
import hansung.popupstore.model.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class PopupStoreMapper {

    // PopupStore를 PopupStoreResponseDto로 변환
    public static PopupStoreResponseDto toDto(PopupStore popupStore) {
        // PopupImage DTO 생성 (null 체크 추가)
        List<PopupImageDto> popupImages = (popupStore.getPopupImages() != null ?
                popupStore.getPopupImages().stream()
                        .map(image -> new PopupImageDto(
                                image.getId(),
                                image.getImageUrl(),
                                image.getPopupStore() != null ? image.getPopupStore().getId() : null
                        ))
                        .collect(Collectors.toList())
                : Collections.emptyList()
        );

        // Category DTO 생성 (null 체크 추가)
        List<CategoryDto> categories = (popupStore.getCategories() != null ?
                popupStore.getCategories().stream()
                        .map(category -> new CategoryDto(
                                category.getId(),
                                category.getCategory()
                        ))
                        .collect(Collectors.toList())
                : Collections.emptyList()
        );

        // PopupStoreResponseDto 생성 및 반환
        return new PopupStoreResponseDto(
                popupStore.getId(),
                popupStore.getTitle(),
                categories,
                popupImages
        );
    }

    // List<PopupStore>를 List<PopupStoreResponseDto>로 변환
    public static List<PopupStoreResponseDto> toDtoList(List<PopupStore> popupStores) {
        return popupStores.stream()
                .map(PopupStoreMapper::toDto)
                .collect(Collectors.toList());
    }
}