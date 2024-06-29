package hansung.popupstore.User.Repository;

import hansung.popupstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    public boolean existsByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email);
    Optional<User> findBynickname(String nickname);
    Optional<User> findByPhone(String phone);
}
