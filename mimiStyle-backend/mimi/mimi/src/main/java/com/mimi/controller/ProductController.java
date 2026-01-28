package com.mimi.controller;

import com.mimi.domain.Product;
import com.mimi.dto.response.ProductResponse;
import com.mimi.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProductResponse>> getUserProducts(@PathVariable Long userId) {
        List<Product> products = productService.getProductsByUserId(userId);
        List<ProductResponse> productResponses = products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductResponse> productResponses = products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
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
                        if ((product.getBuyPrice() == null || product.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) &&
                            (product.getRentPrice() == null || product.getRentPrice().compareTo(BigDecimal.ZERO) <= 0)) {
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
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi server: " + errorMessage);
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
        
        return response;
    }
}