from django_filters import rest_framework as filters
from .models import Organization

class OrganizationFilter(filters.FilterSet):
    """组织架构过滤器"""
    name = filters.CharFilter(lookup_expr='icontains')
    code = filters.CharFilter(lookup_expr='icontains')
    level = filters.ChoiceFilter(choices=Organization.LEVEL_CHOICES)
    status = filters.BooleanFilter()
    parent = filters.NumberFilter()
    
    class Meta:
        model = Organization
        fields = ['name', 'code', 'level', 'status', 'parent'] 