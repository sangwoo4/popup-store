package hansung.popupstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Getter
@Table(name = "popup_store")
public class PopupStore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "title")
    private String title;

    @NotNull
    @Column(name = "address")
    private String address;

    @Column(name = "road_address")
    private String roadAddress;

    @Column(name = "start_date", length = 10)
    private String startDate;

    @Column(name = "end_date", length = 10)
    private String endDate;

    @Column(name = "start_time", length = 10)
    private String startTime;

    @Column(name = "end_time", length = 10)
    private String endTime;

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
