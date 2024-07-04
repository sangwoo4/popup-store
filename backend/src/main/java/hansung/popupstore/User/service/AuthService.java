package hansung.popupstore.User.service;

import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.User.Dto.LoginDto;
import hansung.popupstore.User.Dto.LoginResponseDto;
import hansung.popupstore.User.Dto.ResponseDto;
import hansung.popupstore.User.Dto.SignUpDto;
import hansung.popupstore.User.Repository.UserRepository;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;

    public ResponseDto<?> signUp(SignUpDto dto) {

        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword())
                .birth(dto.getBirth())
                .gender(dto.getGender())
                .nickname(dto.getNickname())
                .phone(dto.getPhone())
                .username(dto.getUsername())
                .build();

        String password = dto.getPassword();

        try {
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String hashedPassword = passwordEncoder.encode(password);

            user.setPassword(hashedPassword);
            userRepository.save(user);
        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    public ResponseDto<SignUpDto> checkEmail(SignUpDto dto) {
        String email = dto.getEmail();

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 email 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 email 입니다.");
    }

    public ResponseDto<SignUpDto> checkNick(SignUpDto dto) {
        String nickName = dto.getNickname();

        Optional<User> userOptional = userRepository.findBynickname(nickName);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 닉네임 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 닉네임 입니다.");
    }

    public ResponseDto<SignUpDto> checkPhone(SignUpDto dto) {
        String phone = dto.getPhone();

        Optional<User> userOptional = userRepository.findByPhone(phone);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 번호 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 번호 입니다.");
    }

    public ResponseDto<LoginResponseDto> login(LoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            // 사용자가 존재하지 않으면 실패 응답 반환
            if (!userOptional.isPresent()) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            User user = userOptional.get();

            // 데이터베이스에서 사용자의 해싱된 비밀번호 가져오기
            String storedHashedPassword = user.getPassword();

            // 비밀번호 일치 여부 확인
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            boolean passwordMatches = passwordEncoder.matches(password, storedHashedPassword);

            // 비밀번호가 일치하지 않으면 실패 응답 반환
            if (!passwordMatches) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            int exprTime = 3600;

            // 토큰 생성
            String token = tokenProvider.generateToken(email, exprTime);
            System.out.println("생성된 토큰: " + token);
            // 로그인 성공 응답 반환
            LoginResponseDto loginResponseDto = new LoginResponseDto(token, exprTime);
            return ResponseDto.setSuccessData("로그인에 성공하였습니다.", loginResponseDto);
        } catch (Exception e) {
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.");
        }
    }

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

