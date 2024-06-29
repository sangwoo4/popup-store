package hansung.popupstore.Security;

import java.security.Key;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
@Service
public class TokenProvider {
    Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private static final String SECURITY_KEY = "inputYourSecurityKey";

    public String validateJwt(String token) {
        try {
            // 서명 확인을 통한 JWT 검증
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            // 토큰의 만료 시간 확인
            Date expiration = claims.getBody().getExpiration();
            Date now = new Date();
            if (expiration.before(now)) {
                // 토큰이 만료된 경우
                System.out.println("null1");
                return null;
            }

            // 토큰이 유효한 경우
            return claims.getBody().getSubject();
        } catch (ExpiredJwtException e) {
            // 토큰이 만료된 경우
            System.out.println("null2");
            return null;
        } catch (Exception e) {
            // 서명이 유효하지 않은 경우
            System.out.println("null3");
            return null;
        }
    }

    public String generateToken(String email, int duration) {
        Instant now = Instant.now();
        Instant exprTime = now.plusSeconds(duration);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exprTime))
                .signWith(key)
                .compact();
    }
}
