from django.contrib import admin
from .models import Organization

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """组织架构管理"""
    list_display = ('name', 'code', 'level', 'parent', 'status', 'sort_order', 'created_at', 'updated_at')
    list_filter = ('level', 'status')
    search_fields = ('name', 'code')
    ordering = ('sort_order', 'created_at')
    list_per_page = 20
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'code', 'level', 'parent')
        }),
        ('状态设置', {
            'fields': ('status', 'sort_order')
        })
    ) 