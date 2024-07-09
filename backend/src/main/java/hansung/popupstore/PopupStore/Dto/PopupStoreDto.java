package hansung.popupstore.PopupStore.Dto;

import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupStore;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "스토어명을 입력해주세요")
    private String title;

    @NotBlank(message = "주소를 입력해주세요")
    private String address;

    private String roadAddress;
    private String startDate;
    private String endDate;
    private String startTime;
    private String endTime;
    private String telephone;

    @NotBlank(message = "가장 가까운 지하철역을 입력해주세요")
    private String subway;

    private String description;
    private String link;
    private String mapx;
    private String mapy;

    private Set<Category> categories = new HashSet<>();

    public PopupStore toEntity() {
        return PopupStore.builder()
                .id(id)
                .title(title)
                .address(address)
                .roadAddress(roadAddress)
                .startDate(startDate)
                .endDate(endDate)
                .startTime(startTime)
                .endTime(endTime)
                .telephone(telephone)
                .subway(subway)
                .description(description)
                .link(link)
                .mapx(mapx)
                .mapy(mapy)
                .categories(new HashSet<>(categories))
                .build();
    }

}