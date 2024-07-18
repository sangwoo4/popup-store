package hansung.popupstore.PopupStore.Dto;

import lombok.Data;

import java.util.List;

@Data
//@NoArgsConstructor
//@AllArgsConstructor
public class NaverResponseDto {
    private String title;
    private String address;
    private String roadAddress;
    private String telephone;
    private String description;
    private String link;
    private String mapx;
    private String mapy;
    private List<Category> categories;

    @Data
    public static class Category {
        private String name;
    }
}
