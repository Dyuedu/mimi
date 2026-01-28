package com.mimi.controller;

import com.mimi.domain.User;
import com.mimi.dto.request.UpdateUserRequest;
import com.mimi.dto.response.UserResponse;
import com.mimi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

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
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Upload avatar file, save it under ./uploads/avatars, and store filename in DB (avatarUrl).
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is required");
        }

        String originalName = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(originalName);
        String safeExt = (ext == null || ext.isBlank()) ? "png" : ext;
        String filename = "avatar_" + id + "_" + UUID.randomUUID() + "." + safeExt;

        Path uploadDir = Paths.get("uploads", "avatars");
        Path targetPath = uploadDir.resolve(filename);

        try {
            Files.createDirectories(uploadDir);
            Files.write(targetPath, file.getBytes());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }

        User user = opt.get();
        user.setAvatarUrl(filename);
        User saved = userRepository.save(user);

        return ResponseEntity.ok(toResponse(saved));
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

