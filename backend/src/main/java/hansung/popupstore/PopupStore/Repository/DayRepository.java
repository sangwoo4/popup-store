package hansung.popupstore.PopupStore.Repository;

import hansung.popupstore.model.Category;
import hansung.popupstore.model.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DayRepository extends JpaRepository<Day, Long> {
    Optional<Day> findByDay(String day);
}
