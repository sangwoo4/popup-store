package hansung.popupstore.Account.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePwdDto {
    private String currentPassword;
    private String newPassword;
}
