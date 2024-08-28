package hansung.popupstore.PopupReservation.Service;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.PopupReservation;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import hansung.popupstore.model.UserReservation;
import hansung.popupstore.PopupReservation.Repository.PopupReservationRepository;
import hansung.popupstore.PopupStore.Repository.UserReservationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor

public class UserReservationService {

    private final UserReservationRepository userReservationRepository;
    private final PopupReservationRepository popupReservationRepository;
    private final UserRepository userRepository;
    private final PopupStoreRepository popupStoreRepository;


    public ResponseDto<Map<String, Object>> userReservation(UserReservationDto dto) {
        // PopupReservation 엔티티 조회
        PopupReservation popupReservation = popupReservationRepository.findById(dto.getPopupReservationId())
                .orElseThrow(() -> new RuntimeException("PopupReservation not found with ID: " + dto.getPopupReservationId()));

        // 현재 예약자 수와 totalReservation 확인
        int currentReservation = popupReservation.getCurrentReservation() == null ? 0 : popupReservation.getCurrentReservation();
        int totalReservation = popupReservation.getTotalReservation();

        // 새로 추가될 인원이 전체 예약 가능 인원을 초과하는지 확인
        if (currentReservation + dto.getNumberOfPeople() > totalReservation) {
            return ResponseDto.setFailed("예약 가능 인원을 초과했습니다.");
        }

        // UserReservation 엔티티 생성 및 저장
        UserReservation userReservation = buildUserReservationEntity(dto);
        userReservationRepository.save(userReservation);

        // 현재 예약자 수 업데이트
        int updatedCurrentReservation = currentReservation + dto.getNumberOfPeople();
        popupReservation.setCurrentReservation(updatedCurrentReservation);

        // 예약 가능한 상태 업데이트
        if (updatedCurrentReservation == totalReservation) {
            popupReservation.setReservationEnabled(false);
            popupReservation.setReservationFull(true);
        }

        popupReservationRepository.save(popupReservation);

        // PopupStore 엔티티 조회 및 예약 정보 업데이트
        PopupStore popupStore = popupStoreRepository.findById(popupReservation.getPopupStore().getId())
                .orElseThrow(() -> new RuntimeException("PopupStore not found with ID: " + popupReservation.getPopupStore().getId()));

        popupStore.updateCurrentReservation(dto.getNumberOfPeople());
        popupStoreRepository.save(popupStore);

        // 클라이언트로 전송할 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("reservationId", popupReservation.getId());
        responseData.put("numberOfPeople", dto.getNumberOfPeople());
        responseData.put("date", popupReservation.getDate());
        responseData.put("startTime", popupReservation.getStartTime());
        responseData.put("title", popupStore.getTitle());

        return ResponseDto.setSuccessData("예약 성공", responseData);
    }

    public ResponseDto<Map<String, Object>> userCancelReservation(UserReservationDto dto) {
        // PopupReservation 엔티티 조회
        Long reservationId = dto.getId();
        UserReservation userReservation = userReservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("PopupReservation not found with ID: " + dto.getId()));

        Long popupId = userReservation.getPopupReservation().getId();

        PopupReservation popupReservation = popupReservationRepository.findById(popupId)
                .orElseThrow(() -> new RuntimeException("PopupReservation not found with ID: " + dto.getPopupReservationId()));

        // 현재 예약자 수와 totalReservation 확인
        int currentReservation = popupReservation.getCurrentReservation() == null ? 0 : popupReservation.getCurrentReservation();

        // 현재 예약자 수 업데이트
        int updatedCurrentReservation = currentReservation - userReservation.getNumberOfPeople();
        popupReservation.setCurrentReservation(updatedCurrentReservation);

        // 예약 가능한 상태 업데이트
//        popupReservation.setReservationEnabled(true);
//        popupReservation.setReservationFull(false);
        if (updatedCurrentReservation < popupReservation.getTotalReservation()) {
            popupReservation.setReservationFull(false);
            popupReservation.setReservationEnabled(true);
        }

        popupReservationRepository.save(popupReservation);

        // PopupStore 엔티티 조회 및 예약 정보 업데이트
        PopupStore popupStore = popupStoreRepository.findById(popupReservation.getPopupStore().getId())
                .orElseThrow(() -> new RuntimeException("PopupStore not found with ID: " + popupReservation.getPopupStore().getId()));

        popupStore.updateCurrentReservation(dto.getNumberOfPeople());
        popupStoreRepository.save(popupStore);


        // 클라이언트로 전송할 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("reservationId", dto.getId());
        responseData.put("date", popupReservation.getDate());
        responseData.put("startTime", popupReservation.getStartTime());
        responseData.put("title", popupStore.getTitle());

        userReservationRepository.deleteById(dto.getId());

        return ResponseDto.setSuccessData("예약 취소 완료", responseData);
    }

    public ResponseDto<List<Map<String, Object>>> userReservationList(Long userId) {
        List<UserReservation> userReservations = userReservationRepository.findByUserId(userId);

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 예약 정보 리스트 구성
        List<Map<String, Object>> reservationsList = new ArrayList<>();
        for (UserReservation userReservation : userReservations) {
            PopupReservation popupReservation = userReservation.getPopupReservation();
            PopupStore popupStore = popupReservation.getPopupStore();

            // 각 예약 정보에 대한 데이터 구성
            Map<String, Object> reservationData = new HashMap<>();
            reservationData.put("reservationId", popupReservation.getId());
            reservationData.put("title", popupStore.getTitle());
            reservationData.put("name", user.getUsername());
            reservationData.put("date", popupReservation.getDate());
            reservationData.put("startTime", popupReservation.getStartTime());
            reservationData.put("numberOfPeople", userReservation.getNumberOfPeople());

            reservationsList.add(reservationData);
        }

        // 성공 응답 반환
        return ResponseDto.setSuccessData("유저 예약 조회 결과", reservationsList);
    }

    public ResponseDto<List<Map<String, Object>>> getReservationsByPopupId(Long popupId) {
        // PopupStoreId로 모든 PopupReservation을 가져옴
        List<PopupReservation> popupReservations = popupReservationRepository.findByPopupStore_Id(popupId);

        List<Map<String, Object>> reservationsList = new ArrayList<>();
        for (PopupReservation popupReservation : popupReservations) {
            // PopupReservation ID를 기반으로 모든 UserReservation을 가져옴
            List<UserReservation> userReservations = userReservationRepository.findByPopupReservationId(popupReservation.getId());

            for (UserReservation userReservation : userReservations) {
                User user = userReservation.getUser(); // UserReservation에서 User 정보 가져오기
                PopupStore popupStore = popupReservation.getPopupStore(); // PopupStore 정보 가져오기

                // 예약 정보 구성
                Map<String, Object> reservationData = new HashMap<>();
                reservationData.put("reservationId", userReservation.getId());
                reservationData.put("title", popupStore.getTitle());
                reservationData.put("name", user.getUsername());
                reservationData.put("date", popupReservation.getDate());
                reservationData.put("startTime", popupReservation.getStartTime());
                reservationData.put("numberOfPeople", userReservation.getNumberOfPeople());

                reservationsList.add(reservationData);
            }
        }

        return ResponseDto.setSuccessData("유저 예약 조회 결과", reservationsList);
    }

    private UserReservation buildUserReservationEntity(UserReservationDto dto) {
        PopupReservation popupReservation = popupReservationRepository.findById(dto.getPopupReservationId())
                .orElseThrow(() -> new RuntimeException("PopupReservation not found with ID: " + dto.getPopupReservationId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        return UserReservation.builder()
                .popupReservation(popupReservation)
                .user(user)
                .numberOfPeople(dto.getNumberOfPeople())
                .build();
    }
}