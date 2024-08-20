package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.model.Day;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DayService {

    private final DayRepository dayRepository;

    public Day getOrCreateDay(String dayName) {
        return dayRepository.findByDay(dayName)
                .orElseGet(() -> {
                    Day newDay = new Day();
                    newDay.setDay(dayName);
                    return dayRepository.save(newDay);
                });
    }



    public List<Day> getAllDays() {
        return dayRepository.findAll();
    }
}