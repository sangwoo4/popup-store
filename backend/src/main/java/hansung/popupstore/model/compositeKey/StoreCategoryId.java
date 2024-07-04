package hansung.popupstore.model.compositeKey;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StoreCategoryId implements Serializable {

    private Long storeId;
    private Long categoryId;

    public StoreCategoryId() {}

    public StoreCategoryId(Long storeId, Long categoryId) {
        this.storeId = storeId;
        this.categoryId = categoryId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoreCategoryId that = (StoreCategoryId) o;
        return Objects.equals(storeId, that.storeId) &&
                Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(storeId, categoryId);
    }
}
