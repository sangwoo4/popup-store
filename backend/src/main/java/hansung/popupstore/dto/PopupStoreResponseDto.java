package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@AllArgsConstructor
public class PopupStoreResponseDto {
    private Long id;
    private String title;
    private List<String> categories;
    private List<String> popupImages;
}