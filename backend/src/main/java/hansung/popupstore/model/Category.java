package hansung.popupstore.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Set;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "characters", length = 20)
    private String characters;

    @Column(name = "cosmetic", length = 20)
    private String cosmetic;

    @Column(name = "food_drink", length = 20)
    private String foodDrink;

    @Column(name = "fancy", length = 20)
    private String fancy;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<StoreCategory> storeCategories;
}
