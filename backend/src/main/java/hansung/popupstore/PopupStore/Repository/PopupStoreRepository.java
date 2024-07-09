package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PopupStoreRepository extends JpaRepository<PopupStore, Long> {
    Optional<PopupStore> findByTitleContaining(String title);
}
