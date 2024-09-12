package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.HeartRecommendResponseDto;
import hansung.popupstore.dto.UserDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.Role;
import hansung.popupstore.model.User;
import hansung.popupstore.Util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TokenProvider tokenProvider;
    private final RoleService roleService;
    private final UserCategoryService categoryService;
    private final PasswordService passwordService;

    @Transactional
    public ResponseDto<?> userSignUp(UserDto dto) {
        try {
            User user = buildUserEntity(dto);
            userRepository.save(user);

            addDefaultRoleToUser(user);
            Set<Category> categories = categoryService.saveOrUpdateUserCategories(dto.getCategories());
            user.setCategories(categories);
            userRepository.save(user);

            return ResponseDto.setSuccess("회원 생성 성공.");
        } catch (Exception e) {
            // 예외 로그
            e.printStackTrace();
            // 트랜잭션 롤백 상태로 마크
            // 필요 시 Custom Exception으로 재던지기
            throw new RuntimeException("회원 생성 실패", e);
        }
    }
    private User buildUserEntity(UserDto dto) {
        String hashedPassword = passwordService.encodePassword(dto.getPassword());
        return User.builder()
                .email(dto.getEmail())
                .password(hashedPassword)
                .birth(dto.getBirth())
                .gender(dto.getGender())
                .nickname(dto.getNickname())
                .phone(dto.getPhone())
                .username(dto.getUsername())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .postcode(dto.getPostcode())
                .address(dto.getAddress())
                .detailAddress(dto.getDetailAddress())
                .build();
    }

    private void addDefaultRoleToUser(User user) {
        Role userRole = roleService.getRoleByRoleName("ROLE_USER");
        user.getRoles().add(userRole);
    }

    public ResponseDto<LoginResponseDto> userLogin(UserLoginDto dto) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(dto.getEmail());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (passwordService.matchesPassword(dto.getPassword(), user.getPassword())) {
                    Set<String> roles = user.getRoles().stream()
                            .map(Role::getName)
                            .collect(Collectors.toSet());

                    // 사용자 ID를 주체로 사용하는 경우
                    String token = tokenProvider.generateToken(user.getId(), roles, 3600);

                    return ResponseDto.setSuccessData("로그인에 성공하였습니다.", new LoginResponseDto(token, 3600));
                }
            }
            return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
        } catch (Exception e) {
            e.printStackTrace(); // 로그 추가 필요
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.");
        }
    }

    public ResponseDto<UserDto> checkEmail(UserDto dto) {
        return checkDuplicateField(dto.getEmail(), "이미 사용중인 email 입니다.", userRepository::findByEmail);
    }

    public ResponseDto<UserDto> checkNick(UserDto dto) {
        return checkDuplicateField(dto.getNickname(), "이미 사용중인 닉네임 입니다.", userRepository::findBynickname);
    }

    public ResponseDto<UserDto> checkPhone(UserDto dto) {
        return checkDuplicateField(dto.getPhone(), "이미 사용중인 번호 입니다.", userRepository::findByPhone);
    }

    private ResponseDto<UserDto> checkDuplicateField(String value, String errorMessage, Function<String, Optional<User>> findUserFunction) {
        if (findUserFunction.apply(value).isPresent()) {
            return ResponseDto.setFailed(errorMessage);
        }
        return ResponseDto.setSuccess("사용 가능한 값 입니다.");
    }

    public String getNicknameByToken(String token) {
        Long userId = Long.valueOf(tokenProvider.validateJwt(token));
        return userRepository.findById(userId).map(User::getNickname).orElse(null);
    }

    public ResponseDto<List<Category>> getAllCategories(){
        List<Category> allCategories = categoryService.getAllCategories().getData();
        return ResponseDto.setSuccessData("카테고리 조회 성공", allCategories);
    }

public UserRecommendDto userCategoryAndAddressFindByUserId(Long userId) {
    Optional<User> userOptional = userRepository.findById(userId);

        User user = userOptional.get();

        UserRecommendDto userRecommendDto = new UserRecommendDto();
        userRecommendDto.setId(user.getId());
        userRecommendDto.setMapx(user.getMapx());
        userRecommendDto.setMapy(user.getMapy());

        Set<CategoryDto> categoryDtos = user.getCategories().stream()
                .map(category -> new CategoryDto(category.getId(), category.getCategory()))
                .collect(Collectors.toSet());
        userRecommendDto.setCategories(categoryDtos);

    // 유저의 하트(좋아요) 정보 설정 (해당 popupStore의 id와 name 설정)
    Set<HeartRecommendResponseDto> heartDtos = user.getHearts().stream()
            .map(heart -> new HeartRecommendResponseDto(
                    heart.getPopupStore().getId()   // PopupStore의 ID만 설정
            ))
            .collect(Collectors.toSet());
    userRecommendDto.setHearts(heartDtos);

    return userRecommendDto;
    }
}