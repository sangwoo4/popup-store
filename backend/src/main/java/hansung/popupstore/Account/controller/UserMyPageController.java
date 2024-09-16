package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.Dto.UserMyPageDto;
import hansung.popupstore.Account.service.UserMyPageService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class UserMyPageController {

    private final UserMyPageService userMyPageService;
    private final TokenUtils tokenUtils;

    // 첫 마이페이지 조회
    @GetMapping("/user")
    public ResponseEntity<ResponseDto<?>> allInfo(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenUtils.extractToken(tokenHeader);
        Long userId = tokenUtils.extractUserIdFromToken(token);

        UserMyPageDto myPageInfo = userMyPageService.getMyPageInfo(userId);

        return ResponseEntity.ok(ResponseDto.setSuccessData("마이페이지 정보 조회 성공", myPageInfo));
    }

    // 비밀번호 확인 API
    @PostMapping("/matchpwd")
    public ResponseEntity<ResponseDto<?>> matchPwd(@RequestHeader("Authorization") String tokenHeader,
                                                   @RequestBody Map<String, String> requestBody) {
        String token = tokenUtils.extractToken(tokenHeader);
        Long userId = tokenUtils.extractUserIdFromToken(token);

        String password = requestBody.get("password");

        boolean isPasswordMatch = userMyPageService.matchPassword(userId, password);

        if (isPasswordMatch) {
            return ResponseEntity.ok(ResponseDto.setSuccess("비밀번호가 일치합니다."));
        } else {
            return ResponseEntity.badRequest().body(ResponseDto.setFailed("비밀번호가 일치하지 않습니다."));
        }
    }

    // 회원 정보 수정
    @PutMapping("/editinfo")
    public ResponseEntity<ResponseDto<?>> editInfo(@RequestHeader("Authorization") String tokenHeader,
                                                   @RequestBody UserDto userDto) {
        String token = tokenUtils.extractToken(tokenHeader);
        Long userId = tokenUtils.extractUserIdFromToken(token);

        return ResponseEntity.ok(userMyPageService.updateUserInfo(userId, userDto));
    }

    // 회원 정보 조회
    @GetMapping("/getinfo")
    public ResponseEntity<ResponseDto<UserDto>> getInfo(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenUtils.extractToken(tokenHeader);
        Long userId = tokenUtils.extractUserIdFromToken(token);

        UserDto userInfo = userMyPageService.getUserInfo(userId);
        return ResponseEntity.ok(ResponseDto.setSuccessData("회원 정보 조회 성공", userInfo));
    }

    // 회원 정보 삭제
    @DeleteMapping("/deleteinfo")
    public ResponseEntity<ResponseDto<?>> delete(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenUtils.extractToken(tokenHeader);
        Long userId = tokenUtils.extractUserIdFromToken(token);

        userMyPageService.deleteUser(userId);

        return ResponseEntity.ok(ResponseDto.setSuccess("회원 탈퇴가 성공적으로 처리되었습니다."));
    }
}
