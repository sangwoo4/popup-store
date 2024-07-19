package hansung.popupstore.PopupStore.Dto;

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

//    public PopupStore toEntity() {
//        PopupStore popupStore = PopupStore.builder()
//                .id(id)
//                .title(title)
//                .address(address)
//                .roadAddress(roadAddress)
//                .startDate(startDate)
//                .endDate(endDate)
//                .telephone(telephone)
//                .subway(subway)
//                .description(description)
//                .link(link)
//                .mapx(mapx)
//                .mapy(mapy)
//                .build();
//
//        if (categories != null) {
//            popupStore.setCategories(new HashSet<>(categories));
//        } else {
//            popupStore.setCategories(new HashSet<>()); // 또는 null 처리 로직 추가
//        }
//
//        return popupStore;
//    }

//    public static PopupStoreDto fromEntity(PopupStore popupStore) {
//        Set<StoreDayDto> storeDayDtos = new HashSet<>();
//        for (StoreDay storeDay : popupStore.getStoreDays()) {
//            storeDayDtos.add(StoreDayDto.fromEntity(storeDay));
//        }
//
//        return PopupStoreDto.builder()
//                .id(popupStore.getId())
//                .title(popupStore.getTitle())
//                .address(popupStore.getAddress())
//                .roadAddress(popupStore.getRoadAddress())
//                .startDate(popupStore.getStartDate())
//                .endDate(popupStore.getEndDate())
//                .telephone(popupStore.getTelephone())
//                .subway(popupStore.getSubway())
//                .description(popupStore.getDescription())
//                .link(popupStore.getLink())
//                .mapx(popupStore.getMapx())
//                .mapy(popupStore.getMapy())
//                .categories(popupStore.getCategories())
//                .storeDays(storeDayDtos)
//                .build();
//    }
}