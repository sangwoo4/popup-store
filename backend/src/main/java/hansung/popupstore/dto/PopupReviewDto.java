package hansung.popupstore.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@Data
public class PopupReviewDto {
    private Long popupStoreId;
    private Long userId;
    private String reviewText;
    private LocalDate localDate;
}
