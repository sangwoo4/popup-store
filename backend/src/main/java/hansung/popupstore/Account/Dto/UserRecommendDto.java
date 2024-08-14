package hansung.popupstore.Account.Dto;

import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.model.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor

public class UserRecommendDto {
    private Long id;
    private String mapx;
    private String mapy;
    private Set<CategoryDto> categories = new HashSet<>();
}