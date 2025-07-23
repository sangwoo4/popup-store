package hansung.popupstore.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import hansung.popupstore.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PopupReviewDto {
    private Long popupStoreId;
    private Long userId; // 사용자 ID 추가
    private String reviewText;
    private LocalDateTime localDateTime;
}
