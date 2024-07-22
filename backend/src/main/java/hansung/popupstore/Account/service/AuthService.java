package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final CompanyService companyService;

    public ResponseDto<?> userSignUp(UserSignUpDto dto) {
        return userService.userSignUp(dto);
    }

    public ResponseDto<?> companySignUp(CompanySignUpDto dto) {
        return companyService.companySignUp(dto);
    }

    public ResponseDto<UserSignUpDto> checkEmail(UserSignUpDto dto) {
        return userService.checkEmail(dto);
    }

    public ResponseDto<UserSignUpDto> checkNick(UserSignUpDto dto) {
        return userService.checkNick(dto);
    }

    public ResponseDto<UserSignUpDto> checkPhone(UserSignUpDto dto) {
        return userService.checkPhone(dto);
    }

    public ResponseDto<LoginResponseDto> userLogin(UserLoginDto dto) {
        return userService.userLogin(dto);
    }

    public ResponseDto<LoginResponseDto> companyLogin(CompanyLoginDto dto) {
        return companyService.companyLogin(dto);
    }

    public ResponseDto<CompanySignUpDto> checkCompanyEmail(CompanySignUpDto dto){
        return companyService.checkCompanyEmail(dto);
    }

    public ResponseDto<CompanySignUpDto> checkCompanyId(CompanySignUpDto dto){
        return companyService.checkCompanyId(dto);
    }
}