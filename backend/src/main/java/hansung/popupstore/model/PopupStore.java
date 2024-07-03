package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "popup_store")
public class PopupStore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "store_title", length = 30)
    private String store_title;

    @NotNull
    @Column(name = "store_address", length = 30)
    private String store_address;

    @Column(name = "start_date", length = 10)
    private String start_date;

    @Column(name = "end_date", length = 10)
    private String end_date;

    @Column(name = "start_time", length = 10)
    private String start_time;

    @Column(name = "end_time", length = 10)
    private String end_time;

    @Column(name = "tell", length = 15)
    private String tell;

    @NotNull
    @Column(name = "subway", length = 30)
    private String subway;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<StoreCategory> storeCategories;
}
