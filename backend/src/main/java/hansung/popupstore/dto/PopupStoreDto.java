package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupStoreDto {

    private Long id;
    private String title;
    private String address;
    private String roadAddress;
    private String startDate;
    private String endDate;
    private String telephone;
    private String subway;
    private String description;
    private String link;
    private String mapx;
    private String mapy;
    private Set<CategoryDto> categories = new HashSet<>();
    private Set<StoreDayDto> storeDays = new HashSet<>();

}