package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.service.UserService;
import hansung.popupstore.Util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
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

    @GetMapping("/categories")
    public ResponseEntity<ResponseDto<?>> getCategories() {
        ResponseDto<?> result = userService.getAllCategories();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

//    @PostMapping("/likes")
//    public ResponseDto<ResponseDto<?>> likePost(@PathVariable Long postId,)

}
