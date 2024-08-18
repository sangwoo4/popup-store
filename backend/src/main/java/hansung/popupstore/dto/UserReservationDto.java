package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserReservationDto {
    private Long id;
    private Long popupReservationId;
    private Long userId;
    private int numberOfPeople;
}
