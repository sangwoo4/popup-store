package hansung.popupstore.Account.service;

import hansung.popupstore.Security.TokenProvider;

import hansung.popupstore.Account.Repository.UserRepository;

import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private UserRepository userRepository;
    private TokenProvider tokenProvider;

    public String getNicknameByToken(String token) {
        // 토큰의 유효성 검사
        String userEmail = tokenProvider.validateJwt(token);
        if (userEmail == null) {
            // 토큰이 유효하지 않은 경우
            return null;
        }

        // 토큰이 유효한 경우 사용자를 데이터베이스에서 찾음
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isPresent()) {
            // 사용자가 존재하는 경우 닉네임 반환
            return userOptional.get().getNickname();
        } else {
            // 사용자가 존재하지 않는 경우
            return null;
        }
    }
}