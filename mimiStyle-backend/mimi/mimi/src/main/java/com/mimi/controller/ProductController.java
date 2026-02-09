package com.mimi.controller;

import com.mimi.domain.Product;
import com.mimi.domain.ProductImage;
import com.mimi.dto.response.ProductResponse;
import com.mimi.repository.ProductImageRepository;
import com.mimi.service.ProductService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageRepository productImageRepository;
    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        System.out.println("UPLOAD DIR = " + uploadDir);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProductResponse>> getUserProducts(@PathVariable Long userId) {
        List<Product> products = productService.getProductsByUserId(userId);
        List<ProductResponse> productResponses = products.stream().map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductResponse> productResponses = products.stream().map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        ProductResponse response = mapToProductResponse(product);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            // Basic validation
            if (product.getName() == null || product.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên sản phẩm không được để trống");
            }

            if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mô tả sản phẩm không được để trống");
            }

            if (product.getAddressContact() == null || product.getAddressContact().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Địa chỉ không được để trống");
            }

            // Validate prices based on trade type
            if (product.getTradeType() != null) {
                switch (product.getTradeType()) {
                    case BUY_ONLY:
                        if (product.getBuyPrice() == null || product.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) {
                            return ResponseEntity.badRequest().body("Giá bán phải lớn hơn 0");
                        }
                        break;
                    case RENT_ONLY:
                        if (product.getRentPrice() == null || product.getRentPrice().compareTo(BigDecimal.ZERO) <= 0) {
                            return ResponseEntity.badRequest().body("Giá thuê phải lớn hơn 0");
                        }
                        break;
                    case BOTH:
                        if ((product.getBuyPrice() == null || product.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0)
                                && (product.getRentPrice() == null
                                        || product.getRentPrice().compareTo(BigDecimal.ZERO) <= 0)) {
                            return ResponseEntity.badRequest().body("Cần có ít nhất một giá (bán hoặc thuê) lớn hơn 0");
                        }
                        break;
                }
            }

            // Set default seller and category if not provided (temporary solution)
            // These will be handled by ProductService now

            Product savedProduct = productService.saveProduct(product);
            ProductResponse response = mapToProductResponse(savedProduct);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            String errorMessage = ex.getMessage();

            // Handle foreign key constraint errors
            if (errorMessage.contains("foreign key constraint fails")) {
                if (errorMessage.contains("seller_id")) {
                    return ResponseEntity.badRequest().body("Thông tin người bán không tồn tại trong hệ thống");
                } else if (errorMessage.contains("category_id")) {
                    return ResponseEntity.badRequest().body("Danh mục sản phẩm không tồn tại trong hệ thống");
                } else {
                    return ResponseEntity.badRequest().body("Dữ liệu tham chiếu không hợp lệ");
                }
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + errorMessage);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        ProductResponse response = mapToProductResponse(updatedProduct);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @Transactional
    @DeleteMapping("/{productId}/images/{filename}")
    public ResponseEntity<?> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable String filename) {

        if (!isValidFilename(filename)) {
            return ResponseEntity.badRequest().body("Tên file không hợp lệ");
        }

        List<ProductImage> images = productImageRepository.findByProductIdAndImageUrl(productId, filename);

        if (images.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean wasThumbnail = images.stream()
                .anyMatch(img -> Boolean.TRUE.equals(img.getIsThumbnail()));

        deletePhysicalFile(filename);
        productImageRepository.deleteAll(images);

        if (wasThumbnail) {
            resetThumbnail(productId);
        }

        return ResponseEntity.ok("Đã xóa ảnh thành công");
    }

    /* ================== GET IMAGE ================== */
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String filename) {

        if (!isValidFilename(filename)) {
            return ResponseEntity.badRequest().build();
        }

        Path path = resolveUploadPath(filename);

        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] data = Files.readAllBytes(path);
            String type = Optional.ofNullable(Files.probeContentType(path))
                    .orElse("application/octet-stream");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, type)
                    .body(data);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /* ================== UPLOAD IMAGE FILE ================== */
    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(
            @RequestParam("files") MultipartFile[] files) {

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            List<String> filenames = new ArrayList<>();

            for (MultipartFile file : files) {

                if (file.isEmpty())
                    continue;

                String filename = generateFilename(file.getOriginalFilename());
                Files.copy(file.getInputStream(),
                        uploadPath.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);

                filenames.add(filename);
            }

            return ResponseEntity.ok(filenames);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Upload lỗi: " + e.getMessage());
        }
    }

    /* ================== SAVE IMAGE DB ================== */
    @PostMapping("/{id}/images")
    public ResponseEntity<List<ProductImage>> saveProductImages(
            @PathVariable Long id,
            @RequestBody List<String> filenames) {

        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        if (filenames == null || filenames.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<ProductImage> images = new ArrayList<>();
        boolean thumbnail = true;

        for (String name : filenames) {

            if (!isValidFilename(name))
                continue;

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(name.trim());
            img.setIsThumbnail(thumbnail);

            images.add(img);
            thumbnail = false;
        }

        return ResponseEntity.ok(productImageRepository.saveAll(images));
    }

    /* ===================================================== */
    /* ================== HELPER METHODS ==================== */
    /* ===================================================== */

    private boolean isValidFilename(String filename) {
        return filename != null
                && !filename.isBlank()
                && !filename.contains("..")
                && !filename.contains("/");
    }

    private Path resolveUploadPath(String filename) {
        return Paths.get(uploadDir)
                .resolve(filename)
                .toAbsolutePath()
                .normalize();
    }

    private void deletePhysicalFile(String filename) {
        try {
            Files.deleteIfExists(resolveUploadPath(filename));
        } catch (IOException ignored) {
        }
    }

    private void resetThumbnail(Long productId) {
        List<ProductImage> remaining = productImageRepository.findByProductId(productId);

        if (!remaining.isEmpty()) {
            ProductImage img = remaining.get(0);
            img.setIsThumbnail(true);
            productImageRepository.save(img);
        }
    }

    private String generateFilename(String original) {

        String ext = Optional.ofNullable(original)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse(".jpg");

        return "product_" +
                System.currentTimeMillis() +
                "_" +
                UUID.randomUUID().toString().substring(0, 8) +
                ext;
    }

    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setConditionPercentage(product.getConditionPercentage());
        response.setTradeType(product.getTradeType());
        response.setBuyPrice(product.getBuyPrice());
        response.setRentPrice(product.getRentPrice());
        response.setRentUnit(product.getRentUnit());
        response.setStatus(product.getStatus());
        response.setAddressContact(product.getAddressContact());
        response.setFeatured(product.getFeatured());
        response.setIsNew(product.getIsNew());
        response.setCreatedAt(product.getCreatedAt());

        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setSellerName(product.getSeller().getFullName());
        }

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }

        // Map images - need to fetch them explicitly due to LAZY loading
        try {
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            if (images != null && !images.isEmpty()) {
                List<String> imageUrls = images.stream().map(ProductImage::getImageUrl).collect(Collectors.toList());
                response.setImages(imageUrls);
            }
        } catch (Exception e) {
            // If images can't be loaded, just skip them
            System.err.println("Error loading images for product " + product.getId() + ": " + e.getMessage());
        }

        return response;
    }
}