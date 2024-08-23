package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.UserReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserReservationRepository extends JpaRepository<UserReservation, Long> {
    List<UserReservation> findByUserId(Long userId);
}
