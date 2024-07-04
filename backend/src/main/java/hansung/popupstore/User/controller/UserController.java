package hansung.popupstore.User.controller;

import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.User.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final AuthService authService;
    private final TokenProvider tokenProvider;

    @GetMapping("/nickname")
    public ResponseEntity<String> login(@RequestHeader("Authorization") String authorizationHeader) {
        // Authorization 헤더에서 토큰 추출, "Bearer " 문자열 제거
        String token = authorizationHeader.replace("Bearer ", "");
        System.out.println("got token " + token);
        // 토큰을 사용하여 사용자의 닉네임 가져오기
        String nickname = authService.getNicknameByToken(token);

        // 클라이언트에게 닉네임 반환
        return ResponseEntity.ok(nickname);
    }
}
