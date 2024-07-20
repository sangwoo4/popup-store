package hansung.popupstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

<<<<<<< HEAD
@Data
=======
@Getter
@Setter
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name ="day")
public class Day {

    @Id
<<<<<<< HEAD
    @Column(name = "day_code")
    private int code;
=======
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2

    @Column
    private String day;

<<<<<<< HEAD
    // other fields

    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StoreDay> storeDays;


=======
    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<StoreDay> storeDays = new HashSet<>();

    public Day(String day) {
        this.day = day;
    }
>>>>>>> 1ee7e2ee2b99fb14609d29230dab91c8cda356c2
}
