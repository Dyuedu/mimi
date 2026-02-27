package com.mimi.dto.response;

import com.mimi.domain.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDate birthday;
    private String phoneNumber;
    private String address;
    private String avatarUrl;
    private Role role;
    private Integer pageViews;
}

