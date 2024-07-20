package hansung.popupstore.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@NoArgsConstructor
@Data
public class StoreDayId implements Serializable {
    private Long popupStoreId;
    private int dayId;

    public StoreDayId(Long popupStoreId, int dayId) {
        this.popupStoreId = popupStoreId;
        this.dayId = dayId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoreDayId that = (StoreDayId) o;
        return Objects.equals(popupStoreId, that.popupStoreId) && Objects.equals(dayId, that.dayId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(popupStoreId, dayId);
    }
}