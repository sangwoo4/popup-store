package hansung.popupstore.Account.Repository;

import hansung.popupstore.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmail(String email);
    Optional<Company> findByCompanyId(String companyId);

    @Query("SELECT r.id FROM Company c JOIN c.roles r WHERE c.id = :companyId")
    Set<Long> findRoleIdsByCompanyId(@Param("companyId") Long companyId);
}
