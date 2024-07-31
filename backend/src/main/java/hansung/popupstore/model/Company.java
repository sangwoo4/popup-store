package hansung.popupstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import java.util.HashSet;
import java.util.Set;

@EntityScan
@Entity
@Getter
@NoArgsConstructor

@Table(name = "company")
@Data
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", length = 20, nullable = false)
    private String companyName;

    @Column(name = "manager_name", unique = true, nullable = false)
    private String managerName;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "company_id", unique = true, nullable = false)
    private String companyId;

    @Column
    private String postCode;

    @Column(nullable = false)
    private String detailAddress;


    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "company_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PopupStore> popupStores = new HashSet<>();

    @Builder
    public Company(Long id, String companyName, String managerName, String address, String email, String password, String companyId, Set<Role> roles, Set<PopupStore> popupStores, String postCode, String detailAddress) {
        this.id = id;
        this.companyName = companyName;
        this.managerName = managerName;
        this.address = address;
        this.email = email;
        this.password = password;
        this.companyId = companyId;
        this.roles = roles != null ? roles : new HashSet<>();
        this.detailAddress = detailAddress;
        this.postCode = postCode;
        this.popupStores = popupStores != null ? popupStores : new HashSet<>();
    }
}