package hansung.popupstore.Account.Dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompanySignUpDto {
    private Long companyId;
    private String companyEmail;
    private String password;
    private String companyName;
}
