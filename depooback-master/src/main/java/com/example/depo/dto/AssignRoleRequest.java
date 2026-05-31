package com.example.depo.dto;

public class AssignRoleRequest {
    private Long userId;
    private String roleName;

    public AssignRoleRequest() {}

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}

