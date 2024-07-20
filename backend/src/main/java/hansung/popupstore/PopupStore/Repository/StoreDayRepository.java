package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.StoreDay;
import hansung.popupstore.model.StoreDayId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreDayRepository extends JpaRepository<StoreDay, StoreDayId> {
}
