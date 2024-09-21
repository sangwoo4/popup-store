package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.ChangePwdDto;
import hansung.popupstore.Account.Dto.UserMyPageDto;
import hansung.popupstore.Account.Dto.UserMyPageEditDto;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Service.HeartService;
import hansung.popupstore.PopupStore.Service.PopupReviewService;
import hansung.popupstore.Util.PasswordEncoderUtil;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.dto.UserDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMyPageService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final HeartService heartService;
    private final UserReservationService userReservationService;
    private final PopupReviewService popupReviewService;
    private final PasswordService passwordService;
    private final UserService userService;

    // 마이페이지 정보 조회
    public UserMyPageDto getMyPageInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 각종 데이터를 다른 서비스로부터 가져옴
        List<HeartDto> hearts = heartService.getHeartedPopupStores(userId).getData();
        List<PopupReviewDto> reviews = popupReviewService.getReviewsByUserId(userId);
        List<Map<String, Object>> reservations = userReservationService.userReservationList(userId).getData();

        Set<Category> categories = user.getCategories();
        List<String> categoryNames = categories.stream()
                .map(Category::getCategory)
                .collect(Collectors.toList());

        // 직접 계산한 통계 데이터
        int allHearts = hearts.size();
        int allReviews = reviews.size();
        int allReservations = reservations.size();

        // 반환 DTO 생성
        return new UserMyPageDto(
                user.getNickname(),
                user.getEmail(),
                reservations,
                hearts,
                reviews,
                categoryNames,
                allHearts,
                allReviews,
                allReservations
        );
    }

    // 사용자 정보 조회
    public UserMyPageEditDto getUserInfo(Long userId) {
        User user = findUserById(userId);

        Set<CategoryDto> categoryDtos = user.getCategories().stream()
                .map(category -> new CategoryDto(category.getId(), category.getCategory()))
                .collect(Collectors.toSet());

        return UserMyPageEditDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .birth(user.getBirth())
                .gender(user.getGender())
                .phone(user.getPhone())
                .username(user.getUsername())
                .postcode(user.getPostcode())
                .address(user.getAddress())
                .detailAddress(user.getDetailAddress())
                .mapx(user.getMapx())
                .mapy(user.getMapy())
                .roadAddress(user.getRoadAddress())
                .categories(categoryDtos)
                .build();
    }

    // 회원 정보 수정
    public ResponseDto<?> updateUserInfo(Long userId, UserMyPageEditDto userMyPageEditDto) {
        User user = findUserById(userId);

        // 닉네임 중복 검사
        ResponseDto<?> validationResponse = validateNickname(userMyPageEditDto.getNickname(), userId);
        if (!validationResponse.isResult()) {
            return validationResponse;
        }

        // 사용자 정보 업데이트
        updateUserFields(user, userMyPageEditDto);
        updateUserCategories(user, userMyPageEditDto.getCategories());

        userRepository.save(user);

        return ResponseDto.setSuccess("회원 정보가 성공적으로 수정되었습니다.");
    }

    // 비밀번호 변경
    public ResponseDto<?> changePassword(Long userId, ChangePwdDto changePwdDto) {
        User user = findUserById(userId);

        // 현재 비밀번호가 일치하는지 확인
        if (!PasswordEncoderUtil.matches(changePwdDto.getCurrentPassword(), user.getPassword())) {
            return ResponseDto.setFailed("현재 비밀번호가 일치하지 않습니다.");
        }


        // 새 비밀번호 암호화 후 저장
        user.setPassword(PasswordEncoderUtil.encode(changePwdDto.getNewPassword()));
        userRepository.save(user);

        return ResponseDto.setSuccess("비밀번호가 성공적으로 변경되었습니다.");
    }

    // 회원 탈퇴 처리
    public void deleteUser(Long userId) {
        User user = findUserById(userId);

        user.getCategories().clear();
        user.getRoles().clear();

        userRepository.save(user);

        userRepository.delete(user);
    }

    // 비밀번호 일치 여부 확인
    public boolean matchPassword(Long userId, String rawPassword) {
        User user = findUserById(userId);
        return PasswordEncoderUtil.matches(rawPassword, user.getPassword());
    }

    // userId로 사용자 조회 로직을 메서드로 추출
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    // 사용자 정보 업데이트 메서드
    private void updateUserFields(User user, UserMyPageEditDto userMyPageEditDto) {
        user.setNickname(userMyPageEditDto.getNickname());
        user.setAddress(userMyPageEditDto.getAddress());
        user.setDetailAddress(userMyPageEditDto.getDetailAddress());
        user.setMapx(userMyPageEditDto.getMapx());
        user.setMapy(userMyPageEditDto.getMapy());
        user.setPostcode(userMyPageEditDto.getPostcode());
        user.setRoadAddress(userMyPageEditDto.getRoadAddress());

    }

    // 유효성 검사 메서드
    private ResponseDto<?> validateUserFields(UserDto userDto) {
        ResponseDto<UserDto> nickCheck = userService.checkNick(userDto);
        if (!nickCheck.isResult()) {
            return nickCheck;
        }
        return ResponseDto.setSuccess("유효성 검사 통과");
    }

    // 카테고리 업데이트 처리, user_category 테이블만 수정
    private void updateUserCategories(User user, Set<CategoryDto> newCategories) {
        user.getCategories().clear();
        userRepository.save(user);

        for (CategoryDto categoryDto : newCategories) {
            Category category = categoryRepository.findByCategory(categoryDto.getCategory())
                    .orElseGet(() -> categoryRepository.save(new Category(categoryDto.getCategory())));
            user.getCategories().add(category);
        }

        userRepository.save(user);
    }

    // 닉네임 중복 검사 메서드
    private ResponseDto<?> validateNickname(String nickname, Long userId) {
        // 자신이 아닌 다른 사용자가 같은 닉네임을 사용하는지 확인
        Optional<User> existingUser = userRepository.findBynickname(nickname);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
            return ResponseDto.setFailed("이미 사용중인 닉네임 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 닉네임 입니다.");
    }
}