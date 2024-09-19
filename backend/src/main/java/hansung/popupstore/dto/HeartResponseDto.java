package hansung.popupstore.dto;

import lombok.Data;

@Data
public class HeartResponseDto {
    private Long id;
    private String popupTitle;
    private Long popupStoreId;
    private Long userId;
}
