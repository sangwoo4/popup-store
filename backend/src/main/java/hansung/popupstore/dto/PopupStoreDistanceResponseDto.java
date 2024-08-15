package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
@Getter
@AllArgsConstructor
public class PopupStoreDistanceResponseDto {
    private Long id;
    private String title;
    private List<String> categories;
    private List<String> popupImages;
    private double distance;
}
