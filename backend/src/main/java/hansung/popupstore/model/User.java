package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jdk.jfr.Enabled;
import lombok.*;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import java.util.HashSet;
import java.util.Set;


@Enabled
@Builder
@EntityScan
@NoArgsConstructor
@Entity
@Getter
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @NotNull
    private String password;

    @NotNull
    private String username;

    @NotNull
    @Column(length = 10)
    private String birth;

    @NotNull
    @Column(length = 10)
    private String gender;

    @NotNull
    @Column(unique = true, length = 11)
    private String phone;

    @NotNull
    @Column(unique = true, length = 20)
    private String nickname;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "account_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )

    @Builder.Default //	roles와 popupStores 필드에 기본 값을 설정
    private Set<Role> roles = new HashSet<>();

    // Builder 패턴을 사용할 때 roles 필드를 기본 값으로 초기화
    @Builder
    public User(Long id, String email, String password, String username, String birth, String gender, String phone, String nickname, Set<Role> roles) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.username = username;
        this.birth = birth;
        this.gender = gender;
        this.phone = phone;
        this.nickname = nickname;
        this.roles = roles != null ? roles : new HashSet<>();
    }
}