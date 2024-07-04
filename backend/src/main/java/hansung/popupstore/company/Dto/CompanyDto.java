package hansung.popupstore.company.Dto;


import hansung.popupstore.model.PopupStore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {

    private Long id;
    private String title;
    private String address;
    private String roadAddress;
    private String start_date;
    private String end_date;
    private String start_time;
    private String end_time;
    private String telephone;
    private String subway;
    private String description;
    private String link;
    private int mapx;
    private int mapy;

    public PopupStore toEntity(){
        return PopupStore.builder()
                .id(id)
                .title(title)
                .address(address)
                .roadAddress(roadAddress)
                .start_date(start_date)
                .end_date(end_date)
                .start_time(start_time)
                .end_time(end_time)
                .telephone(telephone)
                .subway(subway)
                .description(description)
                .link(link)
                .mapx(mapx)
                .mapy(mapy)
                .build();
    }
}
