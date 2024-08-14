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
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_store_id_reservation")
    private PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id_reservation")
    private Day day;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "total_reservation")
    private Integer totalReservation;

    @Column(name = "current_reservation")
    private Integer currentReservation;
}