package hansung.popupstore.model;

import hansung.popupstore.model.compositeKey.StoreCategoryId;
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
public class StoreCategory {

    @EmbeddedId
    private StoreCategoryId storeCategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("storeId")
    @JoinColumn(name = "popup_store_id")
    private PopupStore popupStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id")
    private Category category;
}
