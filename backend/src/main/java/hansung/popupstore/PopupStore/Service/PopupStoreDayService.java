package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.PopupStore.Repository.StoreDayRepository;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.model.Day;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.StoreDay;
import hansung.popupstore.model.StoreDayId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupStoreDayService {
    private final DayRepository dayRepository;
    private final StoreDayRepository storeDayRepository;

    public void saveOrUpdateStoreDays(Set<StoreDayDto> storeDayDtos, PopupStore popupStore) {
        for (StoreDayDto storeDayDto : storeDayDtos) {
            Day day = dayRepository.findByDay(storeDayDto.getDay())
                    .orElseGet(() -> {
                        Day newDay = new Day();
                        newDay.setDay(storeDayDto.getDay());
                        return dayRepository.save(newDay);
                    });

            StoreDay storeDay = new StoreDay();
            storeDay.setDay(day);
            storeDay.setPopupStore(popupStore);
            storeDay.setOpenTime(storeDayDto.getOpenTime());
            storeDay.setCloseTime(storeDayDto.getCloseTime());

            StoreDayId storeDayId = new StoreDayId(popupStore.getId(), day.getId());
            storeDay.setId(storeDayId);

            storeDayRepository.save(storeDay);
        }
    }
}