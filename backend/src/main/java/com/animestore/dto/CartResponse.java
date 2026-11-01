package com.animestore.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponse {

    private List<CartItemDto> items = new ArrayList<>();
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal platformFee = BigDecimal.ZERO;
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private int itemCount = 0;

    public CartResponse() {
    }

    public CartResponse(List<CartItemDto> items, BigDecimal subtotal, BigDecimal platformFee, BigDecimal totalAmount, int itemCount) {
        this.items = items;
        this.subtotal = subtotal;
        this.platformFee = platformFee;
        this.totalAmount = totalAmount;
        this.itemCount = itemCount;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }
}
