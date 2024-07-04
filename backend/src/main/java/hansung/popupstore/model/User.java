package hansung.popupstore.model;

import jakarta.persistence.*;
import jdk.jfr.Enabled;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import jakarta.validation.constraints.NotNull;

@Data
@Enabled
@Builder
@EntityScan
@AllArgsConstructor
@NoArgsConstructor
@Entity
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
}
