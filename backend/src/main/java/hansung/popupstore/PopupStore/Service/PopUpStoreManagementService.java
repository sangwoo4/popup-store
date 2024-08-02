package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupImage;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.StoreDay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopUpStoreManagementService {
    private final PopupStoreService popupStoreService;
    private final PopupStoreImageService popupImageService;
    private final PopupStoreCategoryService categoryService;
    private final PopupStoreDayService storeDayService;

    public ResponseDto<?> createPopUp(PopupStoreDto dto) {
        PopupStore popupStore = popupStoreService.createPopupStore(dto);
        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
        popupStore.setCategories(categories);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);
        return ResponseDto.setSuccess("PopupStore created successfully.");
    }

    public ResponseDto<?> registerPopUpWithImage(PopupStoreDto dto, List<MultipartFile> images) throws IOException {
        PopupStore popupStore = popupStoreService.createPopupStore(dto);
        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
        popupStore.setCategories(categories);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);

        if (images != null && !images.isEmpty()) {
            popupImageService.saveOrUpdatePopupImages(dto.getPopupImages(), popupStore, images);
        }

        return ResponseDto.setSuccess("PopupStore created successfully.");
    }

    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto,  List<MultipartFile> images) throws IOException {
        PopupStore popupStore = popupStoreService.updatePopupStore(id, dto);
        popupImageService.deleteAllPopupImages(popupStore);
        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
        popupStore.setCategories(categories);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);
        if (images != null && !images.isEmpty()) {
            popupImageService.saveOrUpdatePopupImages(dto.getPopupImages(), popupStore, images);
        }
        return ResponseDto.setSuccess("PopupStore updated successfully.");
    }

    public ResponseDto<?> getDetail(Long id) {
        PopupStore popupStore = popupStoreService.getPopupStore(id);
        PopupStoreDto popupStoreDto = convertToDto(popupStore);
        return ResponseDto.setSuccessData("Success", popupStoreDto);
    }

    public ResponseDto<?> deleteRegister(Long id) {
        popupStoreService.deletePopupStore(id);
        return ResponseDto.setSuccess("PopupStore deleted successfully.");
    }

    private PopupStoreDto convertToDto(PopupStore popupStore) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : popupStore.getStoreDays()) {
            storeDayDtos.add(StoreDayDto.builder()
                    .day(storeDay.getDay().getDay())
                    .openTime(storeDay.getOpenTime())
                    .closeTime(storeDay.getCloseTime())
                    .build());
        }

        Set<CategoryDto> categoryDtos = new HashSet<>();
        for (Category category : popupStore.getCategories()) {
            categoryDtos.add(CategoryDto.builder()
                    .category(category.getCategory())
                    .build());
        }

        Set<PopupImageDto> popupImageDtos = new HashSet<>();
        for (PopupImage popupImage : popupStore.getPopupImages()) {
            popupImageDtos.add(PopupImageDto.builder()
                    .id(popupImage.getId())
                    .imageUrl(popupImage.getImageUrl())
                    .build());
        }

        return PopupStoreDto.builder()
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
                .categories(categoryDtos)
                .storeDays(storeDayDtos)
                .popupImages(popupImageDtos)
                .build();
    }
}