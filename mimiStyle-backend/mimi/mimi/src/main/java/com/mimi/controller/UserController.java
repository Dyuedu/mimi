package com.mimi.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mimi.domain.User;
import com.mimi.dto.request.UpdateUserRequest;
import com.mimi.dto.response.UserResponse;
import com.mimi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * List all users (for ADMIN). Returns all users in the system.
     */
    @GetMapping("/list")
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> list = userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(toResponse(opt.get()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = opt.get();
        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getBirthday() != null)
            user.setBirthday(request.getBirthday());
        if (request.getPhoneNumber() != null)
            user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Upload avatar file, save it under ./uploads/avatars, and store filename in DB
     * (avatarUrl).
     */
    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("File is required");
        }

        try {
            User user = optionalUser.get();

            /* ========= 1. Chuẩn bị folder ========= */
            Path avatarDir = Paths.get(uploadDir, "avatars")
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(avatarDir);

            /* ========= 2. Tạo filename ========= */
            String original = file.getOriginalFilename();
            String ext = Optional.ofNullable(StringUtils.getFilenameExtension(original))
                    .filter(e -> !e.isBlank())
                    .orElse("png");

            String filename = "avatar_" + id + "_"
                    + UUID.randomUUID().toString().substring(0, 8)
                    + "." + ext;

            Path target = avatarDir.resolve(filename);

            /* ========= 3. Xóa avatar cũ ========= */
            if (user.getAvatarUrl() != null) {
                Path oldAvatar = avatarDir.resolve(user.getAvatarUrl());
                Files.deleteIfExists(oldAvatar);
            }

            /* ========= 4. Lưu file ========= */
            Files.copy(file.getInputStream(), target,
                    StandardCopyOption.REPLACE_EXISTING);

            /* ========= 5. Save DB ========= */
            user.setAvatarUrl(filename);
            userRepository.save(user);

            return ResponseEntity.ok(toResponse(user));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload avatar failed: " + e.getMessage());
        }
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .birthday(user.getBirthday())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }
}
