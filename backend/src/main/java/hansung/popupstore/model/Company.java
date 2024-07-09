package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jdk.jfr.Enabled;
import lombok.*;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import java.util.HashSet;
import java.util.Set;

@Enabled
@EntityScan
@NoArgsConstructor
@Entity
@Data
@Table(name="company")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String password;

    @NotNull
    @Column(name = "company_name", length = 20)
    private String companyName;

    @NotNull
    @Column(unique = true)
    private String email;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "account_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PopupStore> popupStores = new HashSet<>();

    @Builder
    public Company(Long id, String password, String companyName, Set<Role> roles, Set<PopupStore> popupStores, String email) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.companyName = companyName;
        this.roles = roles != null ? roles : new HashSet<>();
        this.popupStores = popupStores != null ? popupStores : new HashSet<>();
    }
}
