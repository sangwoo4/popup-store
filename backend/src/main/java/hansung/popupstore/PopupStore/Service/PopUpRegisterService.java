package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.Account.Dto.ResponseDto;
import hansung.popupstore.Account.Dto.UserSignUpDto;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupStore.PopupStoreDto;
import hansung.popupstore.PopupStore.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.Role;
import hansung.popupstore.model.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PopUpRegisterService {

    private PopupStoreRepository popupStoreRepository;
    private RoleRepository roleRepository;
    private  UserRepository userRepository;
    public ResponseDto<?> signUp(UserSignUpDto dto) {
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
            System.out.println("user");

            Role userRole = roleRepository.findByRole("ROLE_USER").orElseThrow(() -> new RuntimeException("Role not found."));
            user.getRoles().add(userRole);  // roles는 이제 null이 아니므로 NullPointerException이 발생하지 않습니다.
            System.out.println("role");

            userRepository.save(user);

        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    @Transactional
    public PopupStoreDto saveRegister(PopupStoreDto companyDto) {
        PopupStore popupStore = popupStoreRepository.save(companyDto.toEntity());

        if(popupStore == null){
            throw new IllegalStateException("저장하기 실패");
        }
        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .roadAddress(popupStore.getRoadAddress())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .startTime(popupStore.getStartTime())
                .endTime(popupStore.getEndTime())
                .telephone(popupStore.getTelephone())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .build();
    }
}
