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


//    public CompanyDto(Long id, String title, String address, String roadAddress, String start_date,
//                      String end_date, String start_time, String end_time, String telephone, String subway,
//                      String description, String link, int mapx, int mapy) {
//        this.id = id;
//        this.title = title;
//        this.address = address;
//        this.roadAddress = roadAddress;
//        this.start_date = start_date;
//        this.end_date = end_date;
//        this.start_time = start_time;
//        this.end_time = end_time;
//        this.telephone = telephone;
//        this.subway = subway;
//        this.description = description;
//        this.link = link;
//        this.mapx = mapx;
//        this.mapy = mapy;
//    }

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
