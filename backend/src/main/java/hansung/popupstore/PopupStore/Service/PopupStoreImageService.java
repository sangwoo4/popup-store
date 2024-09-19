package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupImageRepository;
import hansung.popupstore.Util.S3Service;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.model.PopupImage;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

//@Service
//@RequiredArgsConstructor
//public class PopupStoreImageService {
//    private final PopupImageRepository popupImageRepository;
//
//    // 기존 이미지를 삭제하는 메서드
//    public void deleteAllPopupImages(PopupStore popupStore) {
//        Set<PopupImage> existingImages = popupStore.getPopupImages();
//        Path directoryPath = Paths.get(System.getProperty("user.dir"), "uploads");
//
//        for (PopupImage image : existingImages) {
//            // 파일 시스템에서 이미지 삭제
//            Path filePath = Paths.get(image.getImageUrl());
//            try {
//                Files.deleteIfExists(filePath);
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//
//            // 데이터베이스에서 이미지 삭제
//            popupImageRepository.delete(image);
//        }
//        // 메모리에서 이미지 클리어
//        popupStore.getPopupImages().clear();
//    }
//
//    public void saveOrUpdatePopupImages(Set<PopupImageDto> popupImages, PopupStore popupStore, List<MultipartFile> images) throws IOException {
//        // 1. 새 이미지 저장
//        if (images != null && !images.isEmpty()) {
//            Path directoryPath = Paths.get(System.getProperty("user.dir"), "uploads");
//            if (!Files.exists(directoryPath)) {
//                Files.createDirectories(directoryPath);
//            }
//
//            // 새로 추가된 이미지 파일 처리
//            for (MultipartFile image : images) {
//                if (image == null || image.isEmpty()) {
//                    continue;
//                }
//
//                String originalFilename = image.getOriginalFilename();
//                if (originalFilename == null || originalFilename.isEmpty()) {
//                    throw new IOException("Invalid file name.");
//                }
//
//                // 파일명 정리 및 고유한 이름 생성
//                String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
//                String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
//                Path filePath = directoryPath.resolve(uniqueFilename);
//                image.transferTo(filePath.toFile());
//
//                // 파일명을 데이터베이스에 저장
//                PopupImage uploadedImage = PopupImage.builder()
//                        .imageUrl(uniqueFilename)  // URL 대신 파일명만 저장
//                        .popupStore(popupStore)
//                        .build();
//                popupImageRepository.save(uploadedImage);
//            }
//        }
//
//        // 2. 기존 이미지 처리 (Optional)
//        for (PopupImageDto popupImageDto : popupImages) {
//            PopupImage popupImage = PopupImage.builder()
//                    .imageUrl(popupImageDto.getImageUrl())
//                    .popupStore(popupStore)
//                    .build();
//            popupImageRepository.save(popupImage);
//        }
//    }
//}

@Service
@RequiredArgsConstructor
public class PopupStoreImageService {

    private final PopupImageRepository popupImageRepository;
    private final S3Service s3Service;
    private final String bucketName;

    @Autowired
    public PopupStoreImageService(S3Service s3Service, @Value("${cloud.aws.s3.bucket}") String bucketName, PopupImageRepository popupImageRepository) {
        this.s3Service = s3Service;
        this.bucketName = bucketName;
        this.popupImageRepository = popupImageRepository;
    }

    // 기존 이미지를 삭제하는 메서드
    public void deleteAllPopupImages(PopupStore popupStore) {
        Set<PopupImage> existingImages = popupStore.getPopupImages();
        for (PopupImage image : existingImages) {
            // S3에서 이미지 삭제
            s3Service.deleteFile(image.getImageUrl()); // S3Service에서 삭제 메서드 호출

            // 데이터베이스에서 이미지 삭제
            popupImageRepository.delete(image);
        }
        // 메모리에서 이미지 클리어
        popupStore.getPopupImages().clear();
    }

    public void saveOrUpdatePopupImages(Set<PopupImageDto> popupImages, PopupStore popupStore, List<MultipartFile> images) throws IOException {
        // 1. 새 이미지 저장
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String fileName ="https://popspot.s3.ap-northeast-2.amazonaws.com/" + s3Service.uploadFile(image);  // S3에 파일 업로드

                // 업로드된 파일명을 데이터베이스에 저장
                PopupImage uploadedImage = PopupImage.builder()
                        .imageUrl(fileName)  // S3에 저장된 파일명
                        .popupStore(popupStore)
                        .build();
                popupImageRepository.save(uploadedImage);
            }
        }

        // 2. 기존 이미지 처리
        for (PopupImageDto popupImageDto : popupImages) {
            // 기존 이미지를 데이터베이스에 저장
            PopupImage popupImage = PopupImage.builder()
                    .imageUrl(popupImageDto.getImageUrl())
                    .popupStore(popupStore)
                    .build();
            popupImageRepository.save(popupImage);
        }
    }
}