package hansung.popupstore.Security;


import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class TokenUtils {

    private final TokenProvider tokenProvider;

    public String extractToken(String header) {
        return header.replace("Bearer ", "");
    }
    public Long extractCompanyIdFromToken(String header) {
        String jwtToken = extractToken(header);
        String companyIdStr = tokenProvider.validateJwt(jwtToken);
        if (companyIdStr == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        return Long.parseLong(companyIdStr);
    }

    public Long extractUserIdFromToken(String header){
        String jwtToken = extractToken(header);
        String userIdStr = tokenProvider.validateJwt(jwtToken);
        if (userIdStr == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰이거나 사용자 정보가 포함되지 않았습니다.");
        }
        return Long.parseLong(userIdStr);
    }
}