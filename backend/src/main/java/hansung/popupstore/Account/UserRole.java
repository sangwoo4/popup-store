package hansung.popupstore.Account;

import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN("ROLE_ADMIN"),
    USER("ROLE_USER"),
    COMPANY("ROLE_COMPANY");

    UserRole(String value){
        this.value = value;
    }

    private String value;
}
