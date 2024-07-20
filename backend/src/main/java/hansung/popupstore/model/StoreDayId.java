package hansung.popupstore.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
public class StoreDayId implements Serializable {
    @Column(name = "popup_store_id")
    private Long popupStoreId;

    @Column(name = "day_code")
    private int dayCode;

    public StoreDayId() {
    }

    public StoreDayId(Long popupStoreId, int dayCode) {
        this.popupStoreId = popupStoreId;
        this.dayCode = dayCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoreDayId that = (StoreDayId) o;
        return Objects.equals(popupStoreId, that.popupStoreId) && Objects.equals(dayCode, that.dayCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(popupStoreId, dayCode);
    }

}
