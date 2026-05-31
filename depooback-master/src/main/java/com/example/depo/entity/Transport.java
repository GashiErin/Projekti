package com.example.depo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;

import java.time.LocalDate;

@Entity
@Table(name = "transport")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transport_company", length = 150)
    private String transportCompany;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(length = 50)
    private String status;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Order order;
}

