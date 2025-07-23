package hansung.popupstore.ChatBot;

import com.google.api.gax.rpc.ApiException;
import hansung.popupstore.Security.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, String>> getChat(
            @RequestBody ChatBotRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Map<String, String> responseMap = new HashMap<>();
        try {
            String response;
            String clientType = request.getClientType();

            if (request.getText().contains("내 카테고리 조회")) {
                if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                    throw new IllegalArgumentException("로그인 후 물어봐주세요.");
                }
                String token = tokenUtils.extractToken(authorizationHeader);
                Long userId = tokenUtils.extractUserIdFromToken(token);

                response = dialogFlowService.handleUserInput(request.getText(), userId, clientType);
            } else {
                response = dialogFlowService.handleUserInput(request.getText(), null, clientType);
            }

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