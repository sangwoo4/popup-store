package hansung.popupstore.Account.service;

import hansung.popupstore.Util.PasswordEncoderUtil;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    public String encodePassword(String password) {
        return PasswordEncoderUtil.encode(password);
    }

    public boolean matchesPassword(String rawPassword, String encodedPassword) {
        return PasswordEncoderUtil.matches(rawPassword, encodedPassword);
    }
}