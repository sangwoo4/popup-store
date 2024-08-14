package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Getter
@Setter
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;
    private String username;
    private String birth;
    private String gender;

    @Column(unique = true)
    private String phone;

    @Column(unique = true)
    private String nickname;

    @Column
    private String mapx;

    @Column
    private String address;

    @Column
    private String mapy;

    @Column
    private String roadAddress;

    @Column(nullable = false)
    private String postcode;

    @Column(nullable = false)
    private String detailAddress;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default // 기본값 설정
    private Set<Role> roles = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_category",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default // 기본값 설정
    private Set<Category> categories = new HashSet<>();
}