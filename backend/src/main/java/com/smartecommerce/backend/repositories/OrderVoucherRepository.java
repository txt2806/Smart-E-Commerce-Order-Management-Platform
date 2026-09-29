package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.OrderVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, OrderVoucher.OrderVoucherId> {

    @Query("SELECT CASE WHEN COUNT(ov) > 0 THEN true ELSE false END FROM OrderVoucher ov " +
           "WHERE ov.voucher.id = :voucherId AND ov.order.customer.user.id = :userId")
    boolean existsByVoucherIdAndCustomerUserId(@Param("voucherId") Long voucherId, @Param("userId") Long userId);
}
