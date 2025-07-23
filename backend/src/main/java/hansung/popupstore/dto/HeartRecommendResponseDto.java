package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class HeartRecommendResponseDto {

    private Long popupStoreId;

    public HeartRecommendResponseDto(Long popupStoreId) {
        this.popupStoreId = popupStoreId;
    }

}