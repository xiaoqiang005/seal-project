from django.test import TestCase
from django.core.exceptions import ValidationError
from ..models import Organization

class OrganizationModelTest(TestCase):
    """组织架构模型测试"""
    
    def setUp(self):
        """测试数据初始化"""
        self.province = Organization.objects.create(
            name='测试省份',
            code='110000',
            level='省级',
            status=True,
            sort_order=1
        )
        
        self.city = Organization.objects.create(
            name='测试城市',
            code='110100',
            level='市级',
            parent=self.province,
            status=True,
            sort_order=1
        )
        
    def test_create_organization(self):
        """测试创建组织"""
        self.assertEqual(self.province.name, '测试省份')
        self.assertEqual(self.province.code, '110000')
        self.assertEqual(self.province.level, '省级')
        self.assertIsNone(self.province.parent)
        
    def test_hierarchical_relationship(self):
        """测试层级关系"""
        self.assertEqual(self.city.parent, self.province)
        self.assertEqual(self.city.level, '市级')
        
    def test_code_validation(self):
        """测试编码验证"""
        # 测试编码长度
        with self.assertRaises(ValidationError):
            Organization.objects.create(
                name='测试组织',
                code='12345',  # 5位数字
                level='省级',
                status=True
            )
            
        # 测试编码唯一性
        with self.assertRaises(ValidationError):
            Organization.objects.create(
                name='测试组织2',
                code='110000',  # 重复编码
                level='省级',
                status=True
            )
            
    def test_level_validation(self):
        """测试层级验证"""
        # 测试区级不能添加子级
        district = Organization.objects.create(
            name='测试区',
            code='110101',
            level='区级',
            parent=self.city,
            status=True
        )
        
        with self.assertRaises(ValidationError):
            Organization.objects.create(
                name='测试街道',
                code='110102',
                level='街道级',
                parent=district,
                status=True
            ) 