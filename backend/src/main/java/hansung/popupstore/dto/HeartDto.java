package hansung.popupstore.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Id 값이 없을 시 NULL로 포함(데이터 자체를 표시 X)
public class HeartDto {

    private Long id;
    private Long userId;
    private Long popupStoreId;
}