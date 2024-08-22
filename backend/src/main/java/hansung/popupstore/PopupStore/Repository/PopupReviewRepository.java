package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.PopupReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PopupReviewRepository extends JpaRepository<PopupReview, Long> {
}