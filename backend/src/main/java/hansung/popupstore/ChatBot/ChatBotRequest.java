package hansung.popupstore.ChatBot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatBotRequest {
    private String text;
    private String clientType;  // 클라이언트 타입 필드 추가
}
