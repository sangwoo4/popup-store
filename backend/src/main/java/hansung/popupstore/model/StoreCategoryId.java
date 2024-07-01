package hansung.popupstore.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StoreCategoryId implements Serializable {

    private Long popupStoreId;
    private Long categoryId;

    public StoreCategoryId() {}

    public StoreCategoryId(Long popupStoreId, Long categoryId) {
        this.popupStoreId = popupStoreId;
        this.categoryId = categoryId;
    }

    // Getters and setters

    public Long getPopupStoreId() {
        return popupStoreId;
    }

    public void setPopupStoreId(Long popupStoreId) {
        this.popupStoreId = popupStoreId;
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
        return Objects.equals(popupStoreId, that.popupStoreId) &&
                Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(popupStoreId, categoryId);
    }
}
