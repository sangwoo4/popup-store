package hansung.popupstore.dto;

import lombok.Data;

@Data
public class PopupReviewDto {
    private Long popupStoreId;
    private Long userId;
    private String reviewText;
    private Integer rating;
}
