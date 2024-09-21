package hansung.popupstore.Account.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserMyPageReviewDto {
    private Long reviewId;
    private Long popupStoreId;
    private String popupStoretitle;
    private String reviewText;
    private LocalDateTime localDateTime;
}
