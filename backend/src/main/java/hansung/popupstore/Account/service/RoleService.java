package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public Role getRoleByRoleName(String roleName) {
        return roleRepository.findByRole(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found."));
    }

    public Set<Role> getRolesByIds(Set<Long> roleIds) {
        List<Role> roleList = roleRepository.findAllById(roleIds);
        return roleList.stream().collect(Collectors.toSet());
    }

    public Set<String> getRoleNames(Set<Role> roles) {
        return roles.stream()
                .map(Role::getRole)
                .collect(Collectors.toSet());
    }
}