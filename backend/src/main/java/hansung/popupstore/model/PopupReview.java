package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

import java.time.LocalDateTime;


@Entity
@Data
public class PopupReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long popupStoreId;
    private String reviewText;
//    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_my_page_id")
    private UserMyPage userMyPage;

    // User와의 관계 추가, 회원 탈퇴 시 리뷰 삭제 용도
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime localDateTime;

}