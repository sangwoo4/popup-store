package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import java.util.HashSet;
import java.util.Set;

@Builder
@EntityScan
@NoArgsConstructor
@Entity
@Getter
@Data
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

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

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