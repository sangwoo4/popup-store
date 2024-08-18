package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.dto.*;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.model.*;
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
    private final PopupReservationService popupReservationService;

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
        popupReservationService.saveOrUpdatePopupReservations(dto.getPopupReservations(), popupStore);
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
        popupReservationService.saveOrUpdatePopupReservations(dto.getPopupReservations(), popupStore);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);
        if (images != null && !images.isEmpty()) {
            popupImageService.saveOrUpdatePopupImages(dto.getPopupImages(), popupStore, images);
        }
        return ResponseDto.setSuccess("PopupStore updated successfully.");
    }

//    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto, List<MultipartFile> images) throws IOException {
//        PopupStore popupStore = popupStoreService.updatePopupStore(id, dto);
//
//        // 기존 PopupReservation을 수정 또는 추가
//        popupReservationService.saveOrUpdatePopupReservations(dto.getPopupReservations(), popupStore);
//
//        // StoreDay 수정 또는 추가
//        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
//
//        // Category 수정 또는 추가
//        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
//        popupStore.setCategories(categories);
//
//        // PopupStore의 다른 필드들 수정
//        popupStoreService.updatePopupStoreEntity(popupStore, dto);
//
//        // 이미지가 있을 경우 이미지 업데이트
//        if (images != null && !images.isEmpty()) {
//            popupImageService.saveOrUpdatePopupImages(dto.getPopupImages(), popupStore, images);
//        }
//
//        return ResponseDto.setSuccess("PopupStore updated successfully.");
//    }

    public ResponseDto<?> getDetail(Long id) {
        PopupStore popupStore = popupStoreService.getPopupStore(id);
        PopupStoreDto popupStoreDto = popupStoreService.convertToDto(popupStore);
        return ResponseDto.setSuccessData("Success", popupStoreDto);
    }

    public ResponseDto<?> deleteRegister(Long id) {
        popupStoreService.deletePopupStore(id);
        return ResponseDto.setSuccess("PopupStore deleted successfully.");
    }

}