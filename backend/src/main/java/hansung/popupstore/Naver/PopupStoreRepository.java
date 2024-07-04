package hansung.popupstore.Naver;

import hansung.popupstore.model.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PopupStoreRepository extends JpaRepository<PopupStore, Long> {
    Optional<PopupStore> findByTitle(String title);
    Optional<PopupStore> findByTitleContaining(String title);
}
