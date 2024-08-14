package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.StoreDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreDayRepository extends JpaRepository<StoreDay, StoreDay> {
}
