package com.animestore.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private Boolean isDirectBuy = false;

    private CheckoutItemDto directItem;

    private List<CheckoutItemDto> items;

    public CheckoutRequest() {
    }

    public CheckoutRequest(String shippingAddress, Boolean isDirectBuy, CheckoutItemDto directItem, List<CheckoutItemDto> items) {
        this.shippingAddress = shippingAddress;
        this.isDirectBuy = isDirectBuy;
        this.directItem = directItem;
        this.items = items;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Boolean getIsDirectBuy() {
        return isDirectBuy != null && isDirectBuy;
    }

    public void setIsDirectBuy(Boolean directBuy) {
        isDirectBuy = directBuy;
    }

    public CheckoutItemDto getDirectItem() {
        return directItem;
    }

    public void setDirectItem(CheckoutItemDto directItem) {
        this.directItem = directItem;
    }

    public List<CheckoutItemDto> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItemDto> items) {
        this.items = items;
    }
}
