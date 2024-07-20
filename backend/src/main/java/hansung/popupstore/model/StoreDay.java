package hansung.popupstore.model;

<<<<<<< HEAD
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
=======
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
@Builder
@Table(name = "store_day")
public class StoreDay {

    @EmbeddedId
<<<<<<< HEAD
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
=======
    private StoreDayId id; // 복합 키

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("popupStoreId") // 복합 키의 일부인 popupStoreId에 매핑
    @JoinColumn(name = "popup_store_id") // 외래 키 설정
    private PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dayId") // 복합 키의 일부인 dayId에 매핑
    @JoinColumn(name = "day_id") // 외래 키 설정
    private Day day;

    @Column(name = "open_time")
    private String openTime;

    @Column(name = "close_time")
    private String closeTime;
}
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
