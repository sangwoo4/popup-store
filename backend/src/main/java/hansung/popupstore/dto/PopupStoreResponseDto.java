package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@AllArgsConstructor
public class PopupStoreResponseDto {
    private Long id;
    private String title;
    private String startDate;
    private String endDate;
    private List<CategoryDto> categories;
    private List<PopupImageDto> popupImages;
}