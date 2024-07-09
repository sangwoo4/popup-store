package hansung.popupstore.Account.Repository;

import hansung.popupstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBynickname(String nickname);
    Optional<User> findByPhone(String phone);
}
