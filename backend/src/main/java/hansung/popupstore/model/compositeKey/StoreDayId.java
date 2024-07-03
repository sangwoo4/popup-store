package hansung.popupstore.model.compositeKey;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StoreDayId implements Serializable {

    private Long dayCode;
    private Long storeId;

    public StoreDayId() {}

    public StoreDayId(Long dayCode, Long storeId) {
        this.dayCode = dayCode;
        this.storeId = storeId;
    }

    public Long getDayCode() {
        return dayCode;
    }

    public void setDayCode(Long storeId) {
        this.dayCode = dayCode;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long categoryId) {
        this.storeId = storeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoreDayId that = (StoreDayId) o;
        return Objects.equals(dayCode, that.dayCode) &&
                Objects.equals(storeId, that.storeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dayCode, storeId);
    }
}
