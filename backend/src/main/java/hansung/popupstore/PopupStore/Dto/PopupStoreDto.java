package hansung.popupstore.PopupStore.Dto;

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
                .build();
    }

    public static PopupStoreDto fromEntity(PopupStore popupStore) {
        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .roadAddress(popupStore.getRoadAddress())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .startTime(popupStore.getStartTime())
                .endTime(popupStore.getEndTime())
                .telephone(popupStore.getTelephone())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .build();
    }
}