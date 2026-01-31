package com.mimi.repository;

import com.mimi.domain.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    @Query("SELECT v FROM Voucher v WHERE (v.expirationDate IS NULL OR v.expirationDate > :now) " +
           "AND (v.minOrderValue IS NULL OR v.minOrderValue <= :subtotal)")
    List<Voucher> findApplicable(@Param("now") LocalDateTime now, @Param("subtotal") BigDecimal subtotal);
}
