package hansung.popupstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private Long userId;
    private String email;
    private String password;
    private String confirmPassword;
    private String nickname;
    private String birth;
    private String gender;
    private String phone;
    private String username;
    private String postcode;
    private String address;
    private String detailAddress;
    private String mapx;
    private String mapy;
    private String roadAddress;
    private Set<CategoryDto> categories = new HashSet<>();

}
