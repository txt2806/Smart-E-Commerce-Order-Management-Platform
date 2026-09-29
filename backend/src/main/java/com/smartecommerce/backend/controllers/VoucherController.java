package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.VoucherDto;
import com.smartecommerce.backend.entities.Voucher;
import com.smartecommerce.backend.repositories.VoucherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherRepository voucherRepository;

    public VoucherController(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<VoucherDto> dtos = voucherRepository.findAll().stream().map(v -> {
            String title = "Mã Ưu Đãi";
            String discount = "Giảm $" + v.getDiscountAmount().stripTrailingZeros().toPlainString();
            if ("VIP20".equalsIgnoreCase(v.getCode())) {
                title = "Đặc Quyền Titanium";
                discount = "Giảm 20% đơn từ $1,000";
            } else if ("SMART50".equalsIgnoreCase(v.getCode())) {
                title = "Khách Hàng Thân Thiết";
                discount = "Giảm $50 toàn sàn";
            } else if ("FREESHIP".equalsIgnoreCase(v.getCode())) {
                title = "Vận Chuyển Hỏa Tốc";
                discount = "Miễn 100% phí giao siêu tốc";
            }
            return VoucherDto.builder()
                    .id(v.getId())
                    .code(v.getCode())
                    .title(title)
                    .discount(discount)
                    .discountAmount(v.getDiscountAmount())
                    .validUntil(v.getValidUntil())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
