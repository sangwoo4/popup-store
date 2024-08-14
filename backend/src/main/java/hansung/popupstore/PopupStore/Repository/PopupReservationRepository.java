package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupReservation;
import hansung.popupstore.model.StoreDayId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupReservationRepository extends JpaRepository<PopupReservation, StoreDayId> {
}