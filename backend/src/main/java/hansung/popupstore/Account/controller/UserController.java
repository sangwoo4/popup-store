package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/nickname")
    public ResponseEntity<String> login(@RequestHeader("Authorization") String authorizationHeader) {
        // Authorization 헤더에서 토큰 추출, "Bearer " 문자열 제거
        String token = authorizationHeader.replace("Bearer ", "");
        System.out.println("got token " + token);
        String nickname = userService.getNicknameByToken(token);
        // 클라이언트에게 닉네임 반환
        return ResponseEntity.ok(nickname);
    }

}
