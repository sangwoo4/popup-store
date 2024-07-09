package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(unique = true)
    private String role;

    @Column(unique = true, nullable = false)
    private String name;  // company, user, admin

    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();

    public Role() {}

    public Role(String role) {
        this.role = role;
        this.name = role;  // name 필드를 role 값으로 설정
    }
}