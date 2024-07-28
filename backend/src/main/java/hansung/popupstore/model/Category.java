package hansung.popupstore.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@AllArgsConstructor
@Builder
@Setter
@Entity
@Table(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category", length = 50)
    private String category;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<PopupStore> popupStores = new HashSet<>();

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<User> users = new HashSet<>();

    public Category() {}

    public Category(String category) {
        this.category = category;
    }

}
