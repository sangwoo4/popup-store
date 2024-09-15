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

    // 회원탈퇴를 위한 부모 자식관계 재확립(REMOVE 기능이 없어서 탈퇴시 에러 발생으로 추가)
    @ManyToMany(mappedBy = "categories", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private Set<PopupStore> popupStores = new HashSet<>();

    // 회원탈퇴를 위한 부모 자식관계 재확립(REMOVE 기능이 없어서 탈퇴시 에러 발생으로 추가)
    @ManyToMany(mappedBy = "categories", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private Set<User> users = new HashSet<>();

    public Category() {}

    public Category(String category) {
        this.category = category;
    }

}
