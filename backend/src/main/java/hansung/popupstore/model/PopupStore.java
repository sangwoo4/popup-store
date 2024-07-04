package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    @Column(name = "title", length = 30)
    private String title;

    @NotNull
    @Column(name = "address", length = 30)
    private String address;

    @Column(name = "road_address", length = 30)
    private String roadAddress;

    @Column(name = "start_date", length = 10)
    private String start_date;

    @Column(name = "end_date", length = 10)
    private String end_date;

    @Column(name = "start_time", length = 10)
    private String start_time;

    @Column(name = "end_time", length = 10)
    private String end_time;

    @Column(name = "telephone", length = 15)
    private String telephone;

    @NotNull
    @Column(name = "subway", length = 30)
    private String subway;

    @NotNull
    @Column(name = "mapx", length = 15)
    private String mapx;

    @NotNull
    @Column(name = "mapy", length = 15)
    private String mapy;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "link", length = 50)
    private String link;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<StoreCategory> storeCategories;
}
