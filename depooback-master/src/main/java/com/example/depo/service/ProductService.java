package com.example.depo.service;

import com.example.depo.dto.ProductRequest;
import com.example.depo.entity.Category;
import com.example.depo.entity.Product;
import com.example.depo.entity.Supplier;
import com.example.depo.repository.CategoryRepository;
import com.example.depo.repository.ProductRepository;
import com.example.depo.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          SupplierRepository supplierRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
    }

    public Product createProduct(ProductRequest request) {

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setUnitPrice(request.getUnitPrice());
        product.setSupplier(supplier);
        product.setCategory(category);

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product updatePrice(Long productId, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setUnitPrice(newPrice);
        return productRepository.save(product);
    }
}
