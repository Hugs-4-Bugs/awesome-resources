package com.stripe.stripepayment.Service;


import com.stripe.stripepayment.Dto.OrderDTO;

public interface OrderService {
    OrderDTO saveOrder(OrderDTO orderDTO);
}
