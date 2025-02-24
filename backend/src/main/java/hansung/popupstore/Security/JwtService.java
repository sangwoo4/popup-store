package hansung.popupstore.Security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final TokenUtils tokenUtils;

    public Long extractUserIdFromToken(String token){
        if (token != null && token.startsWith("Bearer ")){
            try{
                return tokenUtils.extractUserIdFromToken(token.substring(7));
            } catch (Exception e){
                System.err.println("Faild to extract userId from token: " + e.getMessage());
            }
        }
        return null;
    }
}