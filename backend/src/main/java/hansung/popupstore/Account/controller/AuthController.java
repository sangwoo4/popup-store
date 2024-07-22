package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.Dto.CompanyLoginDto;
import hansung.popupstore.Account.Dto.CompanySignUpDto;
import hansung.popupstore.Account.Dto.UserLoginDto;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.Account.Dto.UserSignUpDto;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Account.service.AuthService;
import hansung.popupstore.Account.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final RoleRepository roleRepository;
    @PostMapping("/user/signup")
    public ResponseDto<?> userSignUp(@RequestBody UserSignUpDto requestBody){
        ResponseDto<?> result = authService.userSignUp(requestBody);
        return result;
    }

    @PostMapping("/company/signup")
    public ResponseDto<?> companySignUp(@RequestBody CompanySignUpDto requestBody){
        ResponseDto<?> result = authService.companySignUp(requestBody);
        return result;
    }

    @PostMapping("/user/login")
    public ResponseDto<?> userLogin(@RequestBody UserLoginDto requestBody) {
        ResponseDto<?> result = authService.userLogin(requestBody);
        return result;
    }

    @PostMapping("/company/login")
    public ResponseDto<?> companyLogin(@RequestBody CompanyLoginDto requestBody){
        ResponseDto<?> result = authService.companyLogin(requestBody);
        return result;
    }

    @PostMapping("user/signup/check-email")
    public ResponseDto<?> userCheckEmail(@RequestBody UserSignUpDto requestBody){
        ResponseDto<?> result = authService.checkEmail(requestBody);
        return result;
    }

    @PostMapping("user/signup/check-nickname")
    public ResponseDto<?> userCheckNick(@RequestBody UserSignUpDto requestBody){
        ResponseDto<?> result = authService.checkNick(requestBody);
        return result;
    }

    @PostMapping("user/signup/check-phone")
    public ResponseDto<?> userCheckPhone(@RequestBody UserSignUpDto requestBody){
        ResponseDto<?> result = authService.checkPhone(requestBody);
        return result;
    }

    @PostMapping("company/signup/check-email")
    public ResponseDto<?> companyCheckEmail(@RequestBody CompanySignUpDto requestBody){
        ResponseDto<?> result = authService.checkCompanyEmail(requestBody);
        return result;
    }

    @PostMapping("company/signup/check-companyid")
    public ResponseDto<?> checkCompanyId(@RequestBody CompanySignUpDto requestBody){
        ResponseDto<?> result = authService.checkCompanyId(requestBody);
        return result;
    }
}
