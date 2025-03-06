package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupReservation.Repository.PopupReservationRepository;
import hansung.popupstore.PopupReservation.Service.PopupReservationService;
import hansung.popupstore.dto.*;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.model.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final PopupReservationRepository popupReservationRepository;

    @Transactional
    public ResponseDto<?> createPopUp(PopupStoreDto dto) {
        PopupStore popupStore = popupStoreService.createPopupStore(dto);
        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
        popupStore.setCategories(categories);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);
        return ResponseDto.setSuccess("PopupStore created successfully.");
    }
    @Transactional
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

    @Transactional
    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto,  List<MultipartFile> images) throws IOException {
        PopupStore popupStore = popupStoreService.updatePopupStore(id, dto);
        popupImageService.deleteAllPopupImages(popupStore);
        storeDayService.saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        Set<Category> categories = categoryService.saveOrUpdatePopUpCategories(dto.getCategories(), popupStore);
        popupStore.setCategories(categories);
        popupReservationService.saveOrUpdatePopupReservations(dto.getPopupReservations(), popupStore);
        popupStoreService.updatePopupStoreEntity(popupStore, dto);
        if (images != null && !images.isEmpty()) {
            popupImageService.updatePopupImages(dto.getPopupImages(), popupStore, images);
        }
        return ResponseDto.setSuccess("PopupStore updated successfully.");
    }
    @Transactional
    public ResponseDto<?> getDetail(Long id) {
        PopupStore popupStore = popupStoreService.getPopupStore(id);
        PopupStoreDto popupStoreDto = popupStoreService.convertToDto(popupStore);
        return ResponseDto.setSuccessData("Success", popupStoreDto);
    }

    @Transactional
    public ResponseDto<?> deleteRegister(Long id) {
        popupStoreService.deletePopupStore(id);
        return ResponseDto.setSuccess("PopupStore deleted successfully.");
    }

}