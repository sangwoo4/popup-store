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
    @Column(name = "company_name", length = 20) //기업 명
    private String companyName;

    @NotNull
    @Column(name = "manager_name", unique = true) //대표자명
    private String managerName;

    @NotNull
    @Column(name = "addrsess")
    private String address;

    @NotNull
    @Column(name = "email", unique = true)
    private String email;

    @NotNull
    private String password;

    @NotNull
    @Column(name="company_id", unique = true) // 사업자 번호
    private String companyId;

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
    public Company(Long id, String address, String companyId, String password, String managerName, String companyName, Set<Role> roles, Set<PopupStore> popupStores, String email) {
        this.id = id;
        this.email = email;
        this.address = address;
        this.managerName = managerName;
        this.companyId = companyId;
        this.password = password;
        this.companyName = companyName;
        this.roles = roles != null ? roles : new HashSet<>();
        this.popupStores = popupStores != null ? popupStores : new HashSet<>();
    }
}