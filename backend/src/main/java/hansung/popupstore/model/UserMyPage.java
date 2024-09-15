package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_my_page")
public class UserMyPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "all_reservations")
    private int allReservations;

    @Column(name = "all_reviews")
    private int allReviews;

    @Column(name = "all_hearts")
    private int allHearts;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heart_id", nullable = false)
    private Heart heart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popupReview_id", nullable = false)
    private PopupReview popupReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userReservation", nullable = false)
    private  UserReservation userReservation;
}
