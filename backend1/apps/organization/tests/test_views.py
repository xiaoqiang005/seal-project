from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Organization

class OrganizationViewTest(APITestCase):
    """组织架构视图测试"""
    
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
        
        self.list_url = reverse('organization-list')
        self.detail_url = reverse('organization-detail', args=[self.province.id])
        
    def test_list_organizations(self):
        """测试获取组织列表"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
    def test_create_organization(self):
        """测试创建组织"""
        data = {
            'name': '测试区',
            'code': '110101',
            'level': '区级',
            'parent': self.city.id,
            'status': True,
            'sort_order': 1
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Organization.objects.count(), 3)
        
    def test_update_organization(self):
        """测试更新组织"""
        data = {
            'name': '更新后的省份',
            'status': False
        }
        response = self.client.patch(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.province.refresh_from_db()
        self.assertEqual(self.province.name, '更新后的省份')
        self.assertEqual(self.province.status, False)
        
    def test_delete_organization(self):
        """测试删除组织"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Organization.objects.count(), 1)
        
    def test_invalid_level_creation(self):
        """测试无效层级创建"""
        # 测试区级创建省级子级
        district = Organization.objects.create(
            name='测试区',
            code='110101',
            level='区级',
            parent=self.city,
            status=True
        )
        
        data = {
            'name': '测试省份2',
            'code': '120000',
            'level': '省级',
            'parent': district.id,
            'status': True
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 