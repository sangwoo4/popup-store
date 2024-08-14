package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PopupStoreRepository extends JpaRepository<PopupStore, Long> {
    List<PopupStore> findByTitleContaining(String title);
}
