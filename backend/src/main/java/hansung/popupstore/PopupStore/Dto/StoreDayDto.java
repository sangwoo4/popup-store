package hansung.popupstore.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StoreDayDto {
    private Long popupStoreId;
    private Long dayId; // 요일의 ID를 저장할 필드
    private String startTime;
    private String endTime;

    // 기본 생성자
    public StoreDayDto() {
    }
}