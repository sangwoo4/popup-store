package hansung.popupstore.Account.Dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompanySignUpDto {
    private Long id;
    private String companyName;
    private String companyId;
    private String email;
    private String password;
    private String address;
    private String managerName;
}
