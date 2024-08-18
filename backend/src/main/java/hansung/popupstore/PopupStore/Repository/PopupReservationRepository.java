package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupReservation;
import hansung.popupstore.model.StoreDayId; // StoreDayId가 아닌 Long으로 변경해야 할 수 있음
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PopupReservationRepository extends JpaRepository<PopupReservation, StoreDayId> {
    Optional<PopupReservation> findById(Long popupReservationId); // 반환 타입 수정
}