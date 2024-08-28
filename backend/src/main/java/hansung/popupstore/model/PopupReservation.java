package hansung.popupstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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
    private String date;

    @Column(name = "is_reservation_enabled")
    private boolean isReservationEnabled = true;

    @Column(name = "is_reservation_full")
    private boolean isReservationFull = false;

    @OneToMany(mappedBy = "popupReservation", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Set<UserReservation> userReservations = new HashSet<>();


    public boolean getIsReservationEnabled() {
        return isReservationEnabled;
    }

    public Boolean getIsReservationFull() {
        return isReservationFull;
    }
}