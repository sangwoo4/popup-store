package hansung.popupstore.User.controller;

import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.User.Dto.LoginDto;
import hansung.popupstore.User.Dto.ResponseDto;
import hansung.popupstore.User.Dto.SignUpDto;
import hansung.popupstore.User.service.AuthService;
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

    @PostMapping("/signup")
    public ResponseDto<?> signUp(@RequestBody SignUpDto requestBody){
        ResponseDto<?> result = authService.signUp(requestBody);
        return result;
    }

    @PostMapping("/service-login")
    public ResponseDto<?> login(@RequestBody LoginDto requestBody) {
        ResponseDto<?> result = authService.login(requestBody);
        return result;
    }

    @PostMapping("/signup/check-email")
    public ResponseDto<?> checkEmail(@RequestBody SignUpDto requestBody){
        ResponseDto<?> result = authService.checkEmail(requestBody);
        return result;
    }

    @PostMapping("/signup/check-nickname")
    public ResponseDto<?> checkNick(@RequestBody SignUpDto requestBody){
        ResponseDto<?> result = authService.checkNick(requestBody);
        return result;
    }

    @PostMapping("/signup/check-phone")
    public ResponseDto<?> checkPhone(@RequestBody SignUpDto requestBody){
        ResponseDto<?> result = authService.checkPhone(requestBody);
        return result;
    }
}
