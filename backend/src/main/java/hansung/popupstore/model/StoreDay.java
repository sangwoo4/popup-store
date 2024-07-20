package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
@Builder
@Table(name = "store_day")
public class StoreDay {

    @EmbeddedId
    private StoreDayId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("popupStoreId")
    @JoinColumn(name = "popup_store_id")
    private PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dayCode")
    @JoinColumn(name = "day_code")
    private Day day;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    // 기본 생성자
    public StoreDay() {
    }

    public StoreDay(StoreDayId id, PopupStore popupStore, Day day, String startTime, String endTime) {
        this.id = id;
        this.popupStore = popupStore;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

}