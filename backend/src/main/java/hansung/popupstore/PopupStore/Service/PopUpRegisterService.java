package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.PopupStore.Repository.*;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PopUpRegisterService {
    private final PopupStoreRepository popupStoreRepository;
    private final CategoryRepository categoryRepository;
    private final DayRepository dayRepository;
    private final StoreDayRepository storeDayRepository;
    private final CompanyRepository companyRepository;
    private final PopupImageRepository popupImageRepository;

    @Transactional
    public ResponseDto<?> createPopUp(PopupStoreDto dto) {
        // Create PopupStore entity
        PopupStore popupStore = buildPopupStoreEntity(dto);
        System.out.println("popupStore" + popupStore);

        // Save PopupStore entity
        popupStoreRepository.save(popupStore);

        // Save or update StoreDays
        saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);

        // Save or update Categories
        saveOrUpdateCategories(dto.getCategories(), popupStore);

        return ResponseDto.setSuccess("PopupStore created successfully.");
    }

    public ResponseDto<?> registerPopUpWithImage(PopupStoreDto dto, List<MultipartFile> images) throws IOException {
        // 팝업 스토어 엔티티 빌드 및 저장
        PopupStore popupStore = buildPopupStoreEntity(dto);
        popupStoreRepository.save(popupStore);

        // 저장된 팝업 스토어의 날짜, 카테고리 및 이미지 업데이트
        saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);
        saveOrUpdateCategories(dto.getCategories(), popupStore);

        System.out.printf("images==11" + images);
        // 파일이 제공된 경우 이미지 저장
        if (images != null && !images.isEmpty()) {
            saveOrUpdatePopupImages(dto.getPopupImages(), popupStore, images);
        }

        return ResponseDto.setSuccess("PopupStore created successfully.");
    }

    private void saveOrUpdatePopupImages(Set<PopupImageDto> popupImages, PopupStore popupStore, List<MultipartFile> images) throws IOException {
        if (images == null || images.isEmpty()) {
            // 파일이 없을 경우의 처리
            return;
        }

        // 파일 저장 디렉토리 정의 및 생성
        Path directoryPath = Paths.get(System.getProperty("user.dir"), "uploads");
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }

        // 기존의 이미지 데이터 삭제 (옵션: 필요에 따라)
        //popupImageRepository.deleteByPopupStore(popupStore);

        // 기존 이미지 저장 처리
        for (PopupImageDto popupImageDto : popupImages) {
            PopupImage popupImage = PopupImage.builder()
                    .imageUrl(popupImageDto.getImageUrl())
                    .popupStore(popupStore)
                    .build();
            popupImageRepository.save(popupImage);
        }

        // 새로 업로드된 이미지 저장 처리
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                // 파일이 없을 경우의 처리
                continue;
            }

            String originalFilename = image.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new IOException("파일명이 유효하지 않습니다.");
            }

            // 파일명 정제 및 고유 파일명 생성
            String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizedFilename;

            // 전체 파일 경로 정의 및 파일 전송
            Path filePath = directoryPath.resolve(uniqueFilename);
            image.transferTo(filePath.toFile());

            // 파일 URL 생성
            String fileUrl = filePath.toUri().toString();

            // 현재 업로드된 파일의 정보를 PopupImage로 저장
            PopupImage uploadedImage = PopupImage.builder()
                    .imageUrl(fileUrl)
                    .popupStore(popupStore)
                    .build();
            popupImageRepository.save(uploadedImage);
        }
    }

    @Transactional
    public ResponseDto<?> updatePopUp(Long id, PopupStoreDto dto) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            PopupStore popupStore = optionalPopupStore.get();

            // Update PopupStore entity
            updatePopupStoreEntity(popupStore, dto);

            // Update categories
            saveOrUpdateCategories(dto.getCategories(), popupStore);

            // Update StoreDays
            saveOrUpdateStoreDays(dto.getStoreDays(), popupStore);

            // Save updated PopupStore entity
            popupStoreRepository.save(popupStore);

            return ResponseDto.setSuccess("PopupStore updated successfully.");
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    @Transactional(readOnly = true)
    public ResponseDto<?> getDetail(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            PopupStore popupStore = optionalPopupStore.get();
            PopupStoreDto popupStoreDto = convertToDto(popupStore);
            return ResponseDto.setSuccessData("Success", popupStoreDto);
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    @Transactional
    public ResponseDto<?> deleteRegister(Long id) {
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findById(id);
        if (optionalPopupStore.isPresent()) {
            popupStoreRepository.deleteById(id);
            return ResponseDto.setSuccess("PopupStore deleted successfully.");
        } else {
            return ResponseDto.setFailed("PopupStore not found with id: " + id);
        }
    }

    private PopupStore buildPopupStoreEntity(PopupStoreDto dto) {
        // 회사 ID가 null인 경우에 대한 처리
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("회사를 찾을 수 없습니다. ID: " + dto.getCompanyId()));
        }

        // PopupStore 엔티티 생성
        return PopupStore.builder()
                .title(dto.getTitle())
                .address(dto.getAddress())
                .roadAddress(dto.getRoadAddress())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .telephone(dto.getTelephone())
                .subway(dto.getSubway())
                .description(dto.getDescription())
                .link(dto.getLink())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .company(company) // 회사 정보 설정 (null일 수 있음)
                .build();
    }


    private void saveOrUpdateCategories(Set<CategoryDto> categoryDtos, PopupStore popupStore) {
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
        popupStore.setCategories(savedCategories);
    }




    private void saveOrUpdateStoreDays(Set<StoreDayDto> storeDayDtos, PopupStore popupStore) {
        for (StoreDayDto storeDayDto : storeDayDtos) {
            // Day 엔티티 설정
            Day day = dayRepository.findByDay(storeDayDto.getDay())
                    .orElseGet(() -> {
                        Day newDay = new Day();
                        newDay.setDay(storeDayDto.getDay());
                        return dayRepository.save(newDay);
                    });

            // StoreDay 엔티티 설정
            StoreDay storeDay = new StoreDay();
            storeDay.setDay(day);
            storeDay.setPopupStore(popupStore);
            storeDay.setOpenTime(storeDayDto.getOpenTime());
            storeDay.setCloseTime(storeDayDto.getCloseTime());

            // StoreDayId 설정
            StoreDayId storeDayId = new StoreDayId(popupStore.getId(), day.getId());
            storeDay.setId(storeDayId);

            // StoreDay 엔티티 저장
            storeDayRepository.save(storeDay);
        }
    }

    private void updatePopupStoreEntity(PopupStore popupStore, PopupStoreDto dto) {
        popupStore.setTitle(dto.getTitle());
        popupStore.setAddress(dto.getAddress());
        popupStore.setRoadAddress(dto.getRoadAddress());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
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

        return PopupStoreDto.builder()
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
                .build();
    }
}