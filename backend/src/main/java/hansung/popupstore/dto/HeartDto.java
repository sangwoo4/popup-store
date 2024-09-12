package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HeartDto {

    private Long id;
    private Long userId;
    private Long popupStoreId;

    public HeartDto(Long popupStoreId) {
        this.popupStoreId = popupStoreId;
    }

}