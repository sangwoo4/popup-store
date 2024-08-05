package hansung.popupstore.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
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
    private String postCode; // 이 필드가 설정되어야 합니다.
    private String detailAddress;
}