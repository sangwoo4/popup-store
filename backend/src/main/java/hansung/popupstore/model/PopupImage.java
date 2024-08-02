package hansung.popupstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "popup_image")
@Getter
@Setter
@NoArgsConstructor

@Builder
public class PopupImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "popup_store_id")
    @JsonIgnore
    private PopupStore popupStore;

    public PopupImage(Long id, String imageUrl, PopupStore popupStore) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.popupStore = popupStore;
    }
}

