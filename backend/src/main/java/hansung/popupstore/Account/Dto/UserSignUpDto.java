package hansung.popupstore.Account.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserSignUpDto {
    private Long userId;
    private String email;
    private String password;
    private String confirmPassword;
    private String nickname;
    private String birth;
    private String gender;
    private String phone;
    private String username;
}
