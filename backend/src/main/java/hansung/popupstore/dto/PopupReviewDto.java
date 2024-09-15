package hansung.popupstore.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Id 값이 없을 시 NULL로 포함(데이터 자체를 표시 X)
public class PopupReviewDto {
    private Long popupStoreId;
    private Long userId;
    private String reviewText;
    private LocalDate localDate;
}
