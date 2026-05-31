package com.example.depo.dto;



import java.util.List;

public class OrderRequest {

    private Long supplierId;
    private List<OrderItemRequest> items;

    public OrderRequest() {}

    public Long getSupplierId() {
        return supplierId;
    }
    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
