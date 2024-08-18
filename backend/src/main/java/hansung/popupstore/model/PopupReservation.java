package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "popup_reservation")
public class PopupReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_store_id")
    private PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id")
    private Day day;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "total_reservation")
    private Integer totalReservation;

    @Column(name = "current_reservation")
    private Integer currentReservation;

    @Column(name = "date")
    private Integer date;

//    @Column(name = "is_reservation_enabled")
//    private boolean IsReservationEnabled = true;
//
//    @Column(name = "is_reservation_full")
//    private boolean isReservationFull = false;

    public void addReservations(int numberOfPeople) {
        this.currentReservation += numberOfPeople;
    }
}