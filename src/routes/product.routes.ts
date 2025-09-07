import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { validateQuery } from '../middleware/validate-query.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { UpdateProductDto } from '../dto/products/update-product.dto';
import { ProductQueryDto } from '../dto/products/product-query.dto';

const router = Router();
const productController = new ProductController();

// Get all products with pagination and filtering
router.get('/',
    authorization(SubjectEnum.PRODUCT, ActionEnum.READ),
    validateQuery(ProductQueryDto),
    (req, res) => productController.getAllProducts(req, res)
);

// Get product by ID
router.get('/:id',
    authorization(SubjectEnum.PRODUCT, ActionEnum.READ),
    (req, res) => productController.getProductById(req, res)
);

// Get products by category
router.get('/category/:categoryId',
    authorization(SubjectEnum.PRODUCT, ActionEnum.READ),
    (req, res) => productController.getProductsByCategory(req, res)
);

// Get products by stock
router.get('/stock/:stockId',
    authorization(SubjectEnum.PRODUCT, ActionEnum.READ),
    (req, res) => productController.getProductsByStock(req, res)
);

// Get products by price range
router.get('/price/range',
    authorization(SubjectEnum.PRODUCT, ActionEnum.READ),
    (req, res) => productController.getProductsByPriceRange(req, res)
);

// Create new product
router.post('/',
    authorization(SubjectEnum.PRODUCT, ActionEnum.CREATE),
    uploadSingle('image'),
    validateDto(CreateProductDto),
    (req, res) => productController.createProduct(req, res)
);

// Update product
router.put('/:id',
    authorization(SubjectEnum.PRODUCT, ActionEnum.UPDATE),
    uploadSingle('image'),
    validateDto(UpdateProductDto),
    (req, res) => productController.updateProduct(req, res)
);

// Delete product
router.delete('/:id',
    authorization(SubjectEnum.PRODUCT, ActionEnum.DELETE),
    (req, res) => productController.deleteProduct(req, res)
);

export default router;
