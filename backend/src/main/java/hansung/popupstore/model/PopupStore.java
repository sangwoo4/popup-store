package hansung.popupstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
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
    @Column(name = "title")
    private String title;

    @NotNull
    @Column(name = "address")
    private String address;

    @Column(name = "post-code")
    private String postCode;

    @Column(name = "detail_address")
    private String detailAddress;

    @Column
    private String roadAddress;

    @Column(name = "start_date", length = 10)
    private String startDate;

    @Column(name = "end_date", length = 10)
    private String endDate;

    @Column(name = "telephone", length = 15)
    private String telephone;

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

    @Column(name = "link", length = 250)
    private String link;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column
    private Boolean reservation = false;

    @Column(name = "total_reservation")
    private Integer totalReservation;

    @Column(name = "current_reservation")
    private Integer currentReservation;

    @Column(name = "views")
    @ColumnDefault("0")
    private Long views = 0L;  // 기본값 설정


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable (
            name ="store_category",
            joinColumns = @JoinColumn(name = "popup_store_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();


    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<StoreDay> storeDays = new HashSet<>();

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PopupImage> popupImages = new HashSet<>();

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonIgnore
    private Set<PopupReservation> popupReservations = new HashSet<>();

    @Column(name = "heartCount")
    private int heartCount;

    @OneToMany(mappedBy = "popupStore", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Heart> hearts = new HashSet<>();
    
    public void updateCurrentReservation(int numberOfPeople) {
        if (this.currentReservation == null) {
            this.currentReservation = 0;
        }
        this.currentReservation += numberOfPeople;
    }

}
