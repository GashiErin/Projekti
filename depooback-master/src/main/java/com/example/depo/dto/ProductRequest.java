package com.example.depo.dto;

import java.math.BigDecimal;

public class ProductRequest {
    private String name;
    private BigDecimal unitPrice;
    private Long supplierId;
    private Long categoryId;

    public ProductRequest() {}

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Long getSupplierId() {
        return supplierId;
    }
    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public Long getCategoryId() {
        return categoryId;
    }
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
