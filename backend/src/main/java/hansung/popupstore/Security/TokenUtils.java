package hansung.popupstore.Security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TokenUtils {

    private final TokenProvider tokenProvider;

    @Autowired
    public TokenUtils(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    public String extractToken(String header) {
        return header.replace("Bearer ", "");
    }

    public Long extractCompanyIdFromToken(String token) {
        String companyIdStr = tokenProvider.validateJwt(token);
        if (companyIdStr == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        return Long.parseLong(companyIdStr);
    }
}