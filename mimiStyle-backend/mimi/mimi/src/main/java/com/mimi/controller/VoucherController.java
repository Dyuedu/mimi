package com.mimi.controller;

import com.mimi.domain.Voucher;
import com.mimi.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherRepository voucherRepository;

    @GetMapping("/applicable")
    public ResponseEntity<List<Voucher>> getApplicableVouchers(
            @RequestParam(name = "subtotal", required = false, defaultValue = "0") BigDecimal subtotal) {
        List<Voucher> vouchers = voucherRepository.findApplicable(LocalDateTime.now(), subtotal);
        return ResponseEntity.ok(vouchers);
    }
}
