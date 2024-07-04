package hansung.popupstore.PopupStore;

import hansung.popupstore.model.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@EnableJpaRepositories
public interface PopupStoreRepository extends JpaRepository<PopupStore, Long> {
    Optional<PopupStore> findByTitle(String title);
    Optional<PopupStore> findByTitleContaining(String title);
}
