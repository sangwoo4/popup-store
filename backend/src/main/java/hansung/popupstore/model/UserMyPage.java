package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_my_page")
public class UserMyPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "all_reservations")
    private int allReservations;

    @Column(name = "all_reviews")
    private int allReviews;

    @Column(name = "all_hearts")
    private int allHearts;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "userMyPage", cascade = CascadeType.ALL)
    private List<Heart> hearts = new ArrayList<>(); // 초기화 추가

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "userMyPage", cascade = CascadeType.ALL)
    private List<PopupReview> popupReviews = new ArrayList<>(); // 초기화 추가

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "userMyPage", cascade = CascadeType.ALL)
    private List<UserReservation> userReservations = new ArrayList<>(); // 초기화 추가
}
