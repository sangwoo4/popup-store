package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.HeartRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.HeartResponseDto;
import hansung.popupstore.model.Heart;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class HeartService {

    private final HeartRepository heartRepository;
    private final UserRepository userRepository;
    private final PopupStoreRepository popupStoreRepository;

    public ResponseDto<HeartDto> addHeart(Long userId, Long popupStoreId) {
        try {
            User user = findUserById(userId);
            PopupStore popupStore = findPopupStoreById(popupStoreId);

            if (heartRepository.findByUserAndPopupStore(user, popupStore).isPresent()) {
                return ResponseDto.setFailed("이미 해당 팝업스토어를 찜했습니다.");
            }

            Heart heart = new Heart();
            heart.setUser(user);
            heart.setPopupStore(popupStore);
            Heart savedHeart = heartRepository.save(heart);

            heartAll(popupStore, 1);

            HeartDto heartDto = convertToDto(savedHeart);
            return ResponseDto.setSuccessData("찜 추가 성공", heartDto);
        } catch (RuntimeException e) {
            return ResponseDto.setFailed(e.getMessage());
        }
    }

    public ResponseDto<List<HeartDto>> getHeartedPopupStores(Long userId) {
        try {
            User user = findUserById(userId);

            List<HeartDto> heartedPopupStores = heartRepository.findAllByUser(user).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseDto.setSuccessData("찜 목록 조회 성공", heartedPopupStores);
        } catch (RuntimeException e) {
            return ResponseDto.setFailed(e.getMessage());
        }
    }


    public ResponseDto<?> getHeartByUserId(Long userId) {
        // 사용자가 찜한 팝업 스토어 목록 조회
        List<Heart> hearts = heartRepository.findAllByUserId(userId);

        // Heart 리스트를 HeartResponseDto 리스트로 변환
        List<HeartResponseDto> heartResponseDtos = hearts.stream().map(heart -> {
            // popupStoreId로 PopupStore 조회
            PopupStore popupStore = popupStoreRepository.findById(heart.getPopupStore().getId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 팝업 스토어가 없습니다."));

            // HeartResponseDto 생성 및 반환
            HeartResponseDto heartResponseDto = new HeartResponseDto();
            heartResponseDto.setId(heart.getId());
            heartResponseDto.setPopupStoreId(heart.getPopupStore().getId());
            heartResponseDto.setPopupTitle(popupStore.getTitle()); // 팝업 스토어 제목 설정
            heartResponseDto.setUserId(userId);
            return heartResponseDto;
        }).collect(Collectors.toList());

        // 응답 데이터 반환
        return ResponseDto.setSuccessData("찜한 팝업 스토어 목록", heartResponseDtos);
    }

    public ResponseDto<?> removeHeart(Long userId, Long popupStoreId) {
        try {
            User user = findUserById(userId);
            PopupStore popupStore = findPopupStoreById(popupStoreId);

            Heart heart = heartRepository.findByUserAndPopupStore(user, popupStore)
                    .orElseThrow(() -> new RuntimeException("해당 팝업스토어에 대한 찜 기록을 찾을 수 없습니다."));

            heartRepository.delete(heart);

            if (popupStore.getHeartCount() > 0) {
                heartAll(popupStore, -1);
            }

            return ResponseDto.setSuccess("찜 취소 성공");
        } catch (RuntimeException e) {
            return ResponseDto.setFailed(e.getMessage());
        }
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("ID가 " + userId + "인 사용자를 찾을 수 없습니다."));
    }

    private PopupStore findPopupStoreById(Long popupStoreId) {
        return popupStoreRepository.findById(popupStoreId)
                .orElseThrow(() -> new RuntimeException("ID가 " + popupStoreId + "인 팝업스토어를 찾을 수 없습니다."));
    }

    private void heartAll(PopupStore popupStore, int count) {
        int newHeartCount = popupStore.getHeartCount() + count;
        popupStore.setHeartCount(Math.max(newHeartCount, 0));
        popupStoreRepository.save(popupStore);
    }

    private HeartDto convertToDto(Heart heart) {
        return HeartDto.builder()
                .id(heart.getId())
                .userId(heart.getUser().getId())
                .popupStoreId(heart.getPopupStore().getId())
                .build();
    }
}