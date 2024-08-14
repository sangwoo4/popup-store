package hansung.popupstore.dto;

import hansung.popupstore.model.Company;
import hansung.popupstore.model.PopupImage;
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
    private String startDate;
    private String endDate;
    private String telephone;
    private String subway;
    private String description;
    private String link;
    private String mapx;
    private String mapy;
    private String postCode;
    private String detailAddress;
    private Long companyId;
    private String companyName;
    private Double distance;
    private String roadAddress;
    private Boolean reservation = false;
    private Integer totalReservation;
    private Integer currentReservation;
    private Set<CategoryDto> categories = new HashSet<>();
    private Set<StoreDayDto> storeDays = new HashSet<>();
    private Set<PopupImageDto> popupImages = new HashSet<>();
    private Set<PopupReservationDto> popupReservations = new HashSet<>();
}