package hansung.popupstore.ChatBot;

import com.google.api.gax.rpc.ApiException;
import hansung.popupstore.Security.TokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chatbot")
public class DialogFlowController {

    private final DialogFlowService dialogFlowService;
    private final TokenUtils tokenUtils;

    @PostMapping("/talk")
    public ResponseEntity<Map<String, String>> getChat(@RequestBody ChatBotRequest request,
                                                       HttpServletRequest httpRequest) {
        Map<String, String> responseMap = new HashMap<>();
        Long userId = null;
        try {
            // 입력된 텍스트 확인 (소문자 및 공백 처리)
            String inputText = request.getText().replaceAll("\\s+", "").toLowerCase();

            // 특정 단어가 포함된 경우에만 JWT 토큰을 검증
            if (inputText.contains("마이페이지") || inputText.contains("예약내역")) {
                String authorizationHeader = httpRequest.getHeader("Authorization");

                if (authorizationHeader == null || authorizationHeader.isEmpty()) {
                    responseMap.put("error", "로그인이 필요합니다");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseMap);
                }

                String token = tokenUtils.extractToken(authorizationHeader);
                userId = tokenUtils.extractUserIdFromToken(token);

                if (userId == null) {
                    throw new IllegalArgumentException("유효하지 않은 사용자입니다.");
                }
            }

            // 특정 단어가 포함된 경우 Fulfillment를 통해 처리, 그렇지 않으면 일반 Dialogflow 응답 처리
            String response = dialogFlowService.handleUserInput(request.getText(), userId);

            responseMap.put("message", response);
            return ResponseEntity.ok(responseMap);
        } catch (ApiException | IOException e) {
            responseMap.put("error", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        } catch (IllegalArgumentException e) {
            responseMap.put("error", "잘못된 요청: " + e.getMessage());
            return ResponseEntity.badRequest().body(responseMap);
        }
    }
}