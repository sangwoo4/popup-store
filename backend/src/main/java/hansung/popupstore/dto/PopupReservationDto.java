package hansung.popupstore.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor // This generates the no-argument constructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PopupReservationDto {
    private Long id;
    private String day;
    private String startTime; // JSON의 start_time과 일치하도록 변경
    private Integer totalReservation; // JSON의 total_reservation과 일치하도록 변경
    private Integer currentReservation; // JSON의 current_reservation과 일치하도록 변경
}