package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.DayRepository;
import hansung.popupstore.PopupStore.Repository.PopupReservationRepository;
import hansung.popupstore.PopupStore.Repository.StoreDayRepository;
import hansung.popupstore.dto.PopupReservationDto;
import hansung.popupstore.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupReservationService {

    private final PopupReservationRepository popupReservationRepository;
    private final StoreDayRepository storeDayRepository;
    private final DayRepository dayRepository;

    @Transactional
    public void saveOrUpdatePopupReservations(Set<PopupReservationDto> popupReservationDtos, PopupStore popupStore) {
        for (PopupReservationDto popupReservationDto : popupReservationDtos) {
            System.out.println("popupReservationDtos: " + popupReservationDtos);
            System.out.println("popupReservationDto: " + popupReservationDto);

            // Day entity lookup or creation
            Day day = dayRepository.findByDay(popupReservationDto.getDay())
                    .orElseGet(() -> {
                        Day newDay = new Day();
                        newDay.setDay(popupReservationDto.getDay());
                        return dayRepository.save(newDay);
                    });

            // PopupReservation entity creation
            PopupReservation popupReservation = new PopupReservation();
            popupReservation.setPopupStore(popupStore);
            popupReservation.setDay(day);
            popupReservation.setStartTime(popupReservationDto.getStartTime());
            popupReservation.setCurrentReservation(popupReservationDto.getCurrentReservation());
            popupReservation.setTotalReservation(popupReservationDto.getTotalReservation());

            // Save PopupReservation entity
            popupReservationRepository.save(popupReservation);
        }
    }
}