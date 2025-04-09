from django.test import TestCase
from ..models import Organization
from ..serializers import OrganizationSerializer

class OrganizationSerializerTest(TestCase):
    """组织架构序列化器测试"""
    
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
        
    def test_organization_serializer(self):
        """测试组织序列化"""
        serializer = OrganizationSerializer(self.province)
        data = serializer.data
        
        self.assertEqual(data['name'], '测试省份')
        self.assertEqual(data['code'], '110000')
        self.assertEqual(data['level'], '省级')
        self.assertIsNone(data['parent'])
        self.assertTrue(data['status'])
        self.assertEqual(data['sort_order'], 1)
        
    def test_organization_deserializer(self):
        """测试组织反序列化"""
        data = {
            'name': '新测试省份',
            'code': '120000',
            'level': '省级',
            'status': True,
            'sort_order': 2
        }
        
        serializer = OrganizationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        organization = serializer.save()
        self.assertEqual(organization.name, '新测试省份')
        self.assertEqual(organization.code, '120000')
        self.assertEqual(organization.level, '省级')
        
    def test_nested_organization_serializer(self):
        """测试嵌套组织序列化"""
        serializer = OrganizationSerializer(self.province)
        data = serializer.data
        
        self.assertEqual(len(data['children']), 1)
        child = data['children'][0]
        self.assertEqual(child['name'], '测试城市')
        self.assertEqual(child['level'], '市级')
        self.assertEqual(child['parent'], self.province.id) 