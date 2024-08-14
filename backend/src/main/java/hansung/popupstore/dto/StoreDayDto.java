package hansung.popupstore.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import hansung.popupstore.model.StoreDay;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StoreDayDto {
    private String dayId; // String representation of dayId
    private String openTime;
    private String closeTime;
    private String day; // Day of the week as a string (e.g., Monday)

    // Constructor for JSON deserialization
    @JsonCreator
    public StoreDayDto(@JsonProperty("dayId") String dayId,
                       @JsonProperty("openTime") String openTime,
                       @JsonProperty("closeTime") String closeTime,
                       @JsonProperty("day") String day) {
        this.dayId = dayId;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.day = day;
    }

    // Method to convert from StoreDay entity to StoreDayDto
//    public static StoreDayDto fromEntity(StoreDay storeDay) {
//        return StoreDayDto.builder()
//                .dayId(String.valueOf(storeDay.getDay().getId())) // Convert dayId to String
//                .openTime(storeDay.getOpenTime())
//                .closeTime(storeDay.getCloseTime())
//                .day(storeDay.getDay().getDay()) // Get the day as a string (e.g., Monday)
//                .build();
//    }
}