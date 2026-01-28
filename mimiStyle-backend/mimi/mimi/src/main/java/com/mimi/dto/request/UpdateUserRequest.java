package com.mimi.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {
    private String fullName;
    private LocalDate birthday;
    private String phoneNumber;
    private String address;
}

