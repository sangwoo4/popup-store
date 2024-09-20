package hansung.popupstore.Account.Repository;

import hansung.popupstore.model.User;
import hansung.popupstore.model.UserMyPage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMyPageRepository extends JpaRepository<UserMyPage, Long> {
    int countByUser_Id(int userId);
    UserMyPage findByUser(User user);
}
