package hansung.popupstore.model;

import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
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

    @Column(name = "subway", length = 30)
    private String subway;

    @NotNull
    @Column(name = "mapx", length = 15)
    private String mapx;

    @NotNull
    @Column(name = "mapy", length = 15)
    private String mapy;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "link", length = 50)
    private String link;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable (
            name ="store_category",
            joinColumns = @JoinColumn(name = "popup_store_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable (
            name ="store_day",
            joinColumns = @JoinColumn(name = "popup_store_id"),
            inverseJoinColumns = @JoinColumn(name = "day_code")
    )
    private Set<Day> days = new HashSet<>();

    public void updateFromDto(PopupStoreDto dto) {
        this.title = dto.getTitle();
        this.address = dto.getAddress();
        this.roadAddress = dto.getRoadAddress();
        this.startDate = dto.getStartDate();
        this.endDate = dto.getEndDate();
        this.startTime = dto.getStartTime();
        this.endTime = dto.getEndTime();
        this.telephone = dto.getTelephone();
        this.subway = dto.getSubway();
        this.description = dto.getDescription();
        this.link = dto.getLink();
        this.mapx = dto.getMapx();
        this.mapy = dto.getMapy();
        this.categories.clear();
        this.categories.addAll(dto.getCategories());
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }
}
