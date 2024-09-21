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
            s3Service.deleteFile(image.getImageUrl());

            // 데이터베이스에서 이미지 삭제
            popupImageRepository.delete(image);
        }
        popupStore.getPopupImages().clear();
    }

    // 이미지 수정 기능
    public void updatePopupImages(Set<PopupImageDto> popupImages, PopupStore popupStore, List<MultipartFile> newImages) throws IOException {
        // 1. 기존 이미지 삭제 및 유지 로직
        Set<PopupImage> existingImages = popupStore.getPopupImages();
        System.out.println("newImages" + newImages);
        // 기존 이미지 중에 새로 들어온 이미지가 없으면 삭제
        for (PopupImage existingImage : existingImages) {
            boolean isStillPresent = popupImages.stream()
                    .anyMatch(imageDto -> imageDto.getImageUrl().equals(existingImage.getImageUrl()));

            if (!isStillPresent) {
                // S3에서 이미지 삭제
                s3Service.deleteFile(existingImage.getImageUrl());
                // 데이터베이스에서 이미지 삭제
                popupImageRepository.delete(existingImage);
            }
        }

        // 2. 새 이미지 업로드
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                // 새 이미지를 S3에 업로드
                String fileName = "https://popspot.s3.ap-northeast-2.amazonaws.com/" + s3Service.uploadFile(image);

                // 새 이미지 정보를 데이터베이스에 저장
                PopupImage newPopupImage = PopupImage.builder()
                        .imageUrl(fileName)
                        .popupStore(popupStore)
                        .build();
                popupImageRepository.save(newPopupImage);
            }
        }

        // 3. 기존 이미지 유지 로직
        for (PopupImageDto popupImageDto : popupImages) {
            // 새로 업로드되지 않은 기존 이미지를 데이터베이스에 유지
            PopupImage existingPopupImage = PopupImage.builder()
                    .imageUrl(popupImageDto.getImageUrl())
                    .popupStore(popupStore)
                    .build();
            popupImageRepository.save(existingPopupImage);
        }
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

//@Service
//@RequiredArgsConstructor
//public class PopupStoreImageService {
//
//    private final PopupImageRepository popupImageRepository;
//    private final S3Service s3Service;
//    private final String bucketName;
//
//    @Autowired
//    public PopupStoreImageService(S3Service s3Service, @Value("${cloud.aws.s3.bucket}") String bucketName, PopupImageRepository popupImageRepository) {
//        this.s3Service = s3Service;
//        this.bucketName = bucketName;
//        this.popupImageRepository = popupImageRepository;
//    }
//
//    // 기존 이미지를 삭제하는 메서드
//    public void deleteAllPopupImages(PopupStore popupStore) {
//        Set<PopupImage> existingImages = popupStore.getPopupImages();
//        for (PopupImage image : existingImages) {
//            // S3에서 이미지 삭제
//            s3Service.deleteFile(image.getImageUrl()); // S3Service에서 삭제 메서드 호출
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
//            for (MultipartFile image : images) {
//                if (image == null || image.isEmpty()) {
//                    continue;
//                }
//
//                String fileName = "https://popspot.s3.ap-northeast-2.amazonaws.com/" + s3Service.uploadFile(image);  // S3에 파일 업로드
//
//                // 업로드된 파일명을 데이터베이스에 저장
//                PopupImage uploadedImage = PopupImage.builder()
//                        .imageUrl(fileName)  // S3에 저장된 파일명
//                        .popupStore(popupStore)
//                        .build();
//                popupImageRepository.save(uploadedImage);
//            }
//        }
//
//        // 2. 기존 이미지 처리
//        for (PopupImageDto popupImageDto : popupImages) {
//            // 기존 이미지를 데이터베이스에 저장
//            PopupImage popupImage = PopupImage.builder()
//                    .imageUrl(popupImageDto.getImageUrl())
//                    .popupStore(popupStore)
//                    .build();
//            popupImageRepository.save(popupImage);
//        }
//    }
