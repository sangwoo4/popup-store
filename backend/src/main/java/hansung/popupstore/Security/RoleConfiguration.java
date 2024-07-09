package hansung.popupstore.Security;

import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.model.Role;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@AllArgsConstructor
public class RoleConfiguration {
    private RoleRepository roleRepository;

    @PostConstruct
    @Transactional
    public void initRoles() {
        if (roleRepository.findByRole("ROLE_USER").isEmpty()) {
            Role userRole = new Role("ROLE_USER");
            roleRepository.save(userRole);
        }
        if (roleRepository.findByRole("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role("ROLE_ADMIN");
            roleRepository.save(adminRole);
        }
        if (roleRepository.findByRole("ROLE_COMPANY").isEmpty()) {
            Role companyRole = new Role("ROLE_COMPANY");
            roleRepository.save(companyRole);
        }
    }
}