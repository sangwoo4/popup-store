package hansung.popupstore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "store_category")
@Embeddable
public class StoreCategory {

    @EmbeddedId
    StoreCategoryId storeCategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("popupStoreId")
    @JoinColumn(name = "popup_store_id")
    PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id")
    Category category;
}
