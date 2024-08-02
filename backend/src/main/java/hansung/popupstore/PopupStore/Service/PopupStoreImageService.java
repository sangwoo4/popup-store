package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupImageRepository;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.model.PopupImage;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PopupStoreImageService {
    private final PopupImageRepository popupImageRepository;

    // 기존 이미지를 삭제하는 메서드
    public void deleteAllPopupImages(PopupStore popupStore) {
        Set<PopupImage> existingImages = popupStore.getPopupImages();
        Path directoryPath = Paths.get(System.getProperty("user.dir"), "uploads");

        for (PopupImage image : existingImages) {
            // 파일 시스템에서 이미지 삭제
            Path filePath = Paths.get(image.getImageUrl());
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                e.printStackTrace();
            }

            // 데이터베이스에서 이미지 삭제
            popupImageRepository.delete(image);
        }
        // 메모리에서 이미지 클리어
        popupStore.getPopupImages().clear();
    }

    public void saveOrUpdatePopupImages(Set<PopupImageDto> popupImages, PopupStore popupStore, List<MultipartFile> images) throws IOException {
        // 1. 새 이미지 저장
        if (images != null && !images.isEmpty()) {
            Path directoryPath = Paths.get(System.getProperty("user.dir"), "uploads");
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            // 새로 추가된 이미지 파일 처리
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null || originalFilename.isEmpty()) {
                    throw new IOException("Invalid file name.");
                }

                String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
                Path filePath = directoryPath.resolve(uniqueFilename);
                image.transferTo(filePath.toFile());

                String fileUrl = filePath.toUri().toString();
                PopupImage uploadedImage = PopupImage.builder()
                        .imageUrl(fileUrl)
                        .popupStore(popupStore)
                        .build();
                popupImageRepository.save(uploadedImage);
            }
        }

        // 2. 기존 이미지 처리 (Optional, 필요에 따라 사용)
        // 기존 이미지를 업데이트하거나 새로운 이미지를 추가할 때 필요한 경우에만 사용하세요
        for (PopupImageDto popupImageDto : popupImages) {
            PopupImage popupImage = PopupImage.builder()
                    .imageUrl(popupImageDto.getImageUrl())
                    .popupStore(popupStore)
                    .build();
            popupImageRepository.save(popupImage);
        }
    }
}