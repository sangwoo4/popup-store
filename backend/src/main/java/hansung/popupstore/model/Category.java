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

    @Column(name = "characters")
    private String characters;

    @Column(name = "cosmetic")
    private String cosmetic;

    @Column(name = "food_drink")
    private String foodDrink;

    @Column(name = "fancy")
    private String fancy;

    @OneToMany(mappedBy = "category")
    Set<StoreCategory> store;
}
