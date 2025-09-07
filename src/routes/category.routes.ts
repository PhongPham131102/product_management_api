import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { validateQuery } from '../middleware/validate-query.middleware';
import { CreateCategoryDto } from '../dto/categories/create-category.dto';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto';
import { CategoryQueryDto } from '../dto/categories/category-query.dto';

const router = Router();
const categoryController = new CategoryController();

// Get all categories with pagination and filtering
router.get('/',
    authorization(SubjectEnum.CATEGORY, ActionEnum.READ),
    validateQuery(CategoryQueryDto),
    (req, res) => categoryController.getAllCategories(req, res)
);

// Get category by ID
router.get('/:id',
    authorization(SubjectEnum.CATEGORY, ActionEnum.READ),
    (req, res) => categoryController.getCategoryById(req, res)
);

// Get categories by name
router.get('/search/name',
    authorization(SubjectEnum.CATEGORY, ActionEnum.READ),
    (req, res) => categoryController.getCategoriesByName(req, res)
);

// Create new category
router.post('/',
    authorization(SubjectEnum.CATEGORY, ActionEnum.CREATE),
    validateDto(CreateCategoryDto),
    (req, res) => categoryController.createCategory(req, res)
);

// Update category
router.put('/:id',
    authorization(SubjectEnum.CATEGORY, ActionEnum.UPDATE),
    validateDto(UpdateCategoryDto),
    (req, res) => categoryController.updateCategory(req, res)
);

// Delete category
router.delete('/:id',
    authorization(SubjectEnum.CATEGORY, ActionEnum.DELETE),
    (req, res) => categoryController.deleteCategory(req, res)
);

export default router;
