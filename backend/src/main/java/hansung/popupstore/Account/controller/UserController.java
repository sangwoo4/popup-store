package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.Dto.UserLoginDto;
import hansung.popupstore.Account.service.UserService;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/nickname")
    public ResponseEntity<String> userNickName(@RequestHeader("Authorization") String authorizationHeader) {
        // Authorization 헤더에서 토큰 추출, "Bearer " 문자열 제거
        String token = authorizationHeader.replace("Bearer ", "");
        String nickname = userService.getNicknameByToken(token);
        // 클라이언트에게 닉네임 반환
        return ResponseEntity.ok(nickname);
    }

    @PostMapping("/user/signup")
    public ResponseDto<?> userSignUp(@RequestBody UserDto requestBody){
        ResponseDto<?> result = userService.userSignUp(requestBody);
        return result;
    }


    @PostMapping("/user/login")
    public ResponseDto<?> userLogin(@RequestBody UserLoginDto requestBody) {
        ResponseDto<?> result = userService.userLogin(requestBody);
        return result;
    }

    @PostMapping("user/signup/check-nickname")
    public ResponseDto<?> userCheckNick(@RequestBody UserDto requestBody){
        ResponseDto<?> result = userService.checkNick(requestBody);
        return result;
    }

    @PostMapping("user/signup/check-email")
    public ResponseDto<?> userCheckEmail(@RequestBody UserDto requestBody){
        ResponseDto<?> result = userService.checkEmail(requestBody);
        return result;
    }

    @GetMapping("/categories")
    public ResponseEntity<ResponseDto<?>> getCategories() {
        ResponseDto<?> result = userService.getAllCategories();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("user/signup/check-phone")
    public ResponseDto<?> userCheckPhone(@RequestBody UserDto requestBody){
        ResponseDto<?> result = userService.checkPhone(requestBody);
        return result;
    }


//    @PostMapping("/likes")
//    public ResponseDto<ResponseDto<?>> likePost(@PathVariable Long postId,)

}
