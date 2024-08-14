package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CompanyDto;
import hansung.popupstore.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final CompanyService companyService;

    public ResponseDto<?> userSignUp(UserDto dto) {
        return userService.userSignUp(dto);
    }

    public ResponseDto<?> companySignUp(CompanyDto dto) {
        return companyService.companySignUp(dto);
    }

    public ResponseDto<UserDto> checkEmail(UserDto dto) {
        return userService.checkEmail(dto);
    }

    public ResponseDto<UserDto> checkNick(UserDto dto) {
        return userService.checkNick(dto);
    }

    public ResponseDto<UserDto> checkPhone(UserDto dto) {
        return userService.checkPhone(dto);
    }

    public ResponseDto<LoginResponseDto> userLogin(UserLoginDto dto) {
        return userService.userLogin(dto);
    }

    public ResponseDto<LoginResponseDto> companyLogin(CompanyLoginDto dto) {
        return companyService.companyLogin(dto);
    }

    public ResponseDto<CompanyDto> checkCompanyEmail(CompanyDto dto){
        return companyService.checkCompanyEmail(dto);
    }

    public ResponseDto<CompanyDto> checkCompanyId(CompanyDto dto){
        return companyService.checkCompanyId(dto);
    }
}