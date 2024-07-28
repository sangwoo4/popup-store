package hansung.popupstore.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String companyName;
    private String companyId;
    private String email;
    private String password;
    private String address;
    private String managerName;
    private String postcode;
    private String detailAddress;
}
