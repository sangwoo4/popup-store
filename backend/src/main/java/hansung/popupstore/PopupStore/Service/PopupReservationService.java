package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupReservationRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.Day;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.dto.PopupReservationDto;
import hansung.popupstore.model.PopupReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupReservationService {

    private final PopupReservationRepository popupReservationRepository;
    private final PopupStoreRepository popupStoreRepository;
    private final DayService dayService;

    @Transactional
    public void saveOrUpdatePopupReservations(Set<PopupReservationDto> popupReservationDtos, PopupStore popupStore) {
        Set<PopupReservation> existingReservations = Optional.ofNullable(popupStore.getPopupReservations())
                .orElse(new HashSet<>());

        Set<PopupReservation> updatedReservations = new HashSet<>();

        int existingTotalReservationSum = existingReservations.stream()
                .filter(PopupReservation::getIsReservationEnabled)
                .mapToInt(PopupReservation::getTotalReservation)
                .sum();

        int newTotalReservationSum = 0;

        for (PopupReservationDto dto : popupReservationDtos) {
            Day day = dayService.getOrCreateDay(dto.getDay());

            PopupReservation reservation = dto.getId() != null
                    ? updateExistingReservation(dto)
                    : createNewReservation(dto, popupStore, day);

            newTotalReservationSum += reservation.getIsReservationEnabled() ? reservation.getTotalReservation() : 0;

            popupReservationRepository.save(reservation);
            updatedReservations.add(reservation);
        }

        removeDeletedReservations(existingReservations, updatedReservations);

        popupStore.setTotalReservation(existingTotalReservationSum + newTotalReservationSum);
    }

    private PopupReservation updateExistingReservation(PopupReservationDto dto) {
        PopupReservation reservation = popupReservationRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("예약 ID가 존재하지 않습니다. ID: " + dto.getId()));

        int oldTotalReservation = reservation.getIsReservationEnabled() ? reservation.getTotalReservation() : 0;

        reservation.setStartTime(dto.getStartTime());
        reservation.setTotalReservation(dto.getTotalReservation());
        reservation.setCurrentReservation(dto.getCurrentReservation());
        reservation.setReservationEnabled(dto.getIsReservationEnabled());
        reservation.setReservationFull(dto.getIsReservationFull());
        reservation.setDate(dto.getDate());
        return reservation;
    }

    private PopupReservation createNewReservation(PopupReservationDto dto, PopupStore popupStore, Day day) {
        return PopupReservation.builder()
                .popupStore(popupStore)
                .day(day)
                .startTime(dto.getStartTime())
                .totalReservation(dto.getTotalReservation())
                .currentReservation(dto.getCurrentReservation())
                .isReservationEnabled(dto.getIsReservationEnabled())
                .isReservationFull(dto.getIsReservationFull())
                .date(dto.getDate())
                .build();
    }

    private void removeDeletedReservations(Set<PopupReservation> existingReservations, Set<PopupReservation> updatedReservations) {
        existingReservations.removeIf(existingReservation -> !updatedReservations.contains(existingReservation));

        if (!existingReservations.isEmpty()) {
            popupReservationRepository.deleteAll(existingReservations);
        }
    }
}