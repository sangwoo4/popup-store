package hansung.popupstore.Account.Repository;

import hansung.popupstore.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}
