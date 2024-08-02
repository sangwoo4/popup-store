package hansung.popupstore.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PopupImageDto {
    private Long id;
    private String imageUrl;
    private Long popupStoreId;

    @Builder
    public PopupImageDto(Long id, String imageUrl, Long popupStoreId) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.popupStoreId = popupStoreId;
    }
}