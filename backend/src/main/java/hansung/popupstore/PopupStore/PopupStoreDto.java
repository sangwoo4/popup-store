package hansung.popupstore.PopupStore;


import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String startTime;
    private String endTime;
    private String telephone;
    private String subway;
    private String description;
    private String link;
    private String mapx;
    private String mapy;

    public PopupStore toEntity(){
        return PopupStore.builder()
                .id(id)
                .title(title)
                .address(address)
                .roadAddress(roadAddress)
                .startDate(startDate)
                .endTime(endTime)
                .startTime(startTime)
                .endTime(endTime)
                .telephone(telephone)
                .subway(subway)
                .description(description)
                .link(link)
                .mapx(mapx)
                .mapy(mapy)
                .build();
    }
}
