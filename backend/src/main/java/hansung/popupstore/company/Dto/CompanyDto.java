package hansung.popupstore.company.Dto;


import hansung.popupstore.model.PopupStore;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class CompanyDto {

    private Long id;
    private String store_title;
    private String store_address;
    private String start_date;
    private String end_date;
    private String start_time;
    private String end_time;
    private String tell;
    private String subway;

    public CompanyDto(Long id, String store_title, String store_address, String start_date, String end_date,
                      String start_time, String end_time, String tell, String subway) {
        this.id = id;
        this.store_title = store_title;
        this.store_address = store_address;
        this.start_date = start_date;
        this.end_date = end_date;
        this.start_time = start_time;
        this.end_time = end_time;
        this.tell = tell;
    }

    public PopupStore toEntity(){
        return PopupStore.builder()
                .id(id)
                .store_title(store_title)
                .store_address(store_address)
                .start_date(start_date)
                .end_date(end_date)
                .start_time(start_time)
                .end_time(end_time)
                .tell(tell)
                .subway(subway)
                .build();
    }
}
