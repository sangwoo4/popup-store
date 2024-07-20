package hansung.popupstore.model;

<<<<<<< HEAD
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
=======
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2

import java.io.Serializable;
import java.util.Objects;

@Embeddable
<<<<<<< HEAD
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
=======
@NoArgsConstructor
@Data
public class StoreDayId implements Serializable {
    private Long popupStoreId;
    private int dayId;

    public StoreDayId(Long popupStoreId, int dayId) {
        this.popupStoreId = popupStoreId;
        this.dayId = dayId;
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoreDayId that = (StoreDayId) o;
<<<<<<< HEAD
        return Objects.equals(popupStoreId, that.popupStoreId) && Objects.equals(dayCode, that.dayCode);
=======
        return Objects.equals(popupStoreId, that.popupStoreId) && Objects.equals(dayId, that.dayId);
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
    }

    @Override
    public int hashCode() {
<<<<<<< HEAD
        return Objects.hash(popupStoreId, dayCode);
    }

}
=======
        return Objects.hash(popupStoreId, dayId);
    }
}
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
