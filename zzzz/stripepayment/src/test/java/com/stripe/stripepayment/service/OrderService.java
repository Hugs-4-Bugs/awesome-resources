package com.stripe.stripepayment.service;

import com.stripe.stripepayment.entity.Order;

public interface OrderService {
    Order saveOrder(Order order);
}
