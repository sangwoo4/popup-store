package hansung.popupstore.model;

import hansung.popupstore.model.compositeKey.StoreDayId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "store_day")
public class StoreDay {

    @EmbeddedId
    private StoreDayId storeDayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dayCode")
    @JoinColumn(name = "day_code")
    private Day day;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("storeId")
    @JoinColumn(name = "popup_store_id")
    private PopupStore popupStore;
}
