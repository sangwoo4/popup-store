package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PopupStoreRepository extends JpaRepository<PopupStore, Long> {
    List<PopupStore> findByTitleContaining(String title);

    @Modifying
    @Query("UPDATE PopupStore p SET p.views = p.views + 1 WHERE p.id = :popupStoreId")
    void incrementViewCount(@Param("popupStoreId") Long popupStoreId);
}
