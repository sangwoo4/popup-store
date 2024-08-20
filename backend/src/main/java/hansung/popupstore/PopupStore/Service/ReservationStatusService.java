package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupReservationRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.PopupReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationStatusService {

    private final PopupReservationRepository popupReservationRepository;
    private final PopupStoreRepository popupStoreRepository;

    @Transactional
    public void markDateAsFull(Long popupStoreId, String date) {
        PopupStore popupStore = getPopupStore(popupStoreId);

        Set<PopupReservation> reservations = getReservationsByDate(popupStore, date);

        if (reservations.isEmpty()) {
            throw new IllegalArgumentException("해당 날짜에 대한 예약이 존재하지 않습니다.");
        }

        reservations.forEach(reservation -> {
            reservation.setReservationEnabled(false);
            reservation.setReservationFull(true);
        });

        popupReservationRepository.saveAll(reservations);

        updatePopupStoreTotalReservation(popupStore, reservations);
    }

    @Transactional
    public void markDateAsActive(Long popupStoreId, String date) {
        PopupStore popupStore = getPopupStore(popupStoreId);

        Set<PopupReservation> reservations = getReservationsByDate(popupStore, date);

        if (reservations.isEmpty()) {
            throw new IllegalArgumentException("해당 날짜에 대한 예약이 존재하지 않습니다.");
        }

        reservations.forEach(reservation -> {
            reservation.setReservationEnabled(true);
            reservation.setReservationFull(false);
        });

        popupReservationRepository.saveAll(reservations);
    }

    @Transactional(readOnly = true)
    public boolean isReservationFull(Long popupStoreId, String date) {
        PopupStore popupStore = getPopupStore(popupStoreId);

        return popupStore.getPopupReservations().stream()
                .filter(reservation -> date.equals(reservation.getDate()))
                .allMatch(PopupReservation::getIsReservationFull);
    }

    @Transactional(readOnly = true)
    public boolean isReservationEnabled(Long popupStoreId, String date) {
        PopupStore popupStore = getPopupStore(popupStoreId);

        return popupStore.getPopupReservations().stream()
                .filter(reservation -> date.equals(reservation.getDate()))
                .anyMatch(PopupReservation::getIsReservationEnabled);
    }

    private PopupStore getPopupStore(Long popupStoreId) {
        return popupStoreRepository.findById(popupStoreId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 팝업 스토어 ID입니다."));
    }

    private Set<PopupReservation> getReservationsByDate(PopupStore popupStore, String date) {
        return popupStore.getPopupReservations().stream()
                .filter(reservation -> {
                    if (reservation.getDate() == null) {
                        throw new IllegalArgumentException("예약의 날짜 정보가 없습니다.");
                    }
                    return reservation.getDate().equals(date);
                })
                .collect(Collectors.toSet());
    }

    private void updatePopupStoreTotalReservation(PopupStore popupStore, Set<PopupReservation> reservations) {
        int totalReservation = reservations.stream()
                .mapToInt(PopupReservation::getTotalReservation)
                .sum();
        popupStore.setTotalReservation(totalReservation);
        popupStoreRepository.save(popupStore);
    }
}