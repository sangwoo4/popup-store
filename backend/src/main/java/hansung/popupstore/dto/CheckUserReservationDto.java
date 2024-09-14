package hansung.popupstore.dto;

import lombok.Data;

@Data
public class CheckUserReservationDto {
    private Long popupStoreId;

    public CheckUserReservationDto(Long popupStoreId) {
        this.popupStoreId = popupStoreId;
    }

    public Long getPopupStoreId() {
        return popupStoreId;
    }
}