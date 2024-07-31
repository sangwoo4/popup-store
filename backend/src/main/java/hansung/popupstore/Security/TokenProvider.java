package hansung.popupstore.Security;

import hansung.popupstore.model.Company;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;
import java.util.Set;

@Service
public class TokenProvider {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    // 토큰 검증 및 클레임 추출
    public String validateJwt(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            Date expiration = claims.getBody().getExpiration();
            Date now = new Date();
            if (expiration.before(now)) {
                return null; // 토큰 만료
            }

            return claims.getBody().getSubject(); // 유효한 경우
        } catch (Exception e) {
            return null; // 검증 실패
        }
    }
    // 토큰 생성
    public String generateToken(Long companyId, Set<String> roles, int duration) {
        Instant now = Instant.now();
        Instant expirationTime = now.plusSeconds(duration);
        return Jwts.builder()
                .setSubject(String.valueOf(companyId)) // 회사 ID를 주체로 설정
                .claim("roles", roles) // 사용자 역할 정보 추가
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expirationTime))
                .signWith(key)
                .compact();
    }
    // Key 반환 메서드
    public Key getKey() {
        return key;
    }
}