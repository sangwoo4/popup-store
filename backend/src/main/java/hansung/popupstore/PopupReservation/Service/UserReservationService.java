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

import java.util.HashMap;
import java.util.Map;

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

        // UserReservation 엔티티 생성 및 저장
        UserReservation userReservation = buildUserReservationEntity(dto);
        userReservationRepository.save(userReservation);

        // PopupStore 엔티티 조회 및 currentReservation 업데이트
        PopupStore popupStore = popupStoreRepository.findById(popupReservation.getPopupStore().getId())
                .orElseThrow(() -> new RuntimeException("PopupStore not found with ID: " + popupReservation.getPopupStore().getId()));

        // 현재 예약자 수를 업데이트
        int updatedCurrentReservation = popupReservation.getCurrentReservation() == null
                ? dto.getNumberOfPeople()
                : popupReservation.getCurrentReservation() + dto.getNumberOfPeople();

        popupReservation.setCurrentReservation(updatedCurrentReservation);
        popupReservationRepository.save(popupReservation);

        // 필요하다면 PopupStore의 예약 정보도 업데이트
        popupStore.updateCurrentReservation(dto.getNumberOfPeople());
        popupStoreRepository.save(popupStore);

        // 클라이언트로 전송할 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("reservationId", popupReservation.getId());
        responseData.put("numberOfPeople", dto.getNumberOfPeople());
        responseData.put("date", popupReservation.getDate());
        responseData.put("startTime" , popupReservation.getStartTime());
        responseData.put("title", popupStore.getTitle());

        return ResponseDto.setSuccessData("예약 성공", responseData);
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