package hansung.popupstore.User.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class SignUpDto {
    private Long userKey;
    private String email;
    private String password;
    private String confirmPassword;
    private String nickname;
    private String birth;
    private String gender;
    private String phone;
    private String username;
}
