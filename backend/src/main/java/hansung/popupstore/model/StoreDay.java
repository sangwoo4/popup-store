package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "store_day")
public class StoreDay {

    @EmbeddedId
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