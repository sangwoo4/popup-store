package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.Heart;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface HeartRepository extends JpaRepository<Heart, Long> {
    Optional<Heart> findByUserAndPopupStore(User user, PopupStore popupStore);
    Set<Heart> findAllByUser(User user);

    List<Heart> findAllByUserId(Long userId);
}