package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import hansung.popupstore.model.PopupReservation;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import hansung.popupstore.model.UserReservation;
import hansung.popupstore.PopupStore.Repository.PopupReservationRepository;
import hansung.popupstore.PopupStore.Repository.UserReservationRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor

public class UserReservationService {

    private final UserReservationRepository userReservationRepository;
    private final PopupReservationRepository popupReservationRepository;
    private final UserRepository userRepository;
    private final PopupStoreRepository popupStoreRepository;

    public ResponseDto<UserReservationDto> userReservation(UserReservationDto dto) {
        // PopupReservation 엔티티 조회
        PopupReservation popupReservation = popupReservationRepository.findById(dto.getPopupReservationId())
                .orElseThrow(() -> new RuntimeException("PopupReservation not found with ID: " + dto.getPopupReservationId()));

        // UserReservation 엔티티 생성 및 저장
        UserReservation userReservation = buildUserReservationEntity(dto);
        userReservationRepository.save(userReservation);

        // PopupStore 엔티티 조회 및 currentReservation 업데이트
        PopupStore popupStore = popupStoreRepository.findById(popupReservation.getPopupStore().getId())
                .orElseThrow(() -> new RuntimeException("PopupStore not found with ID: " + popupReservation.getPopupStore().getId()));
        popupStore.updateCurrentReservation(dto.getNumberOfPeople());
        popupStoreRepository.save(popupStore);

        // PopupReservation 엔티티의 currentReservation 업데이트
        popupReservation.setCurrentReservation(
                popupReservation.getCurrentReservation() == null ? dto.getNumberOfPeople() :
                        popupReservation.getCurrentReservation() + dto.getNumberOfPeople()
        );
        popupReservationRepository.save(popupReservation);


        return ResponseDto.setSuccess("예약 성공");
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