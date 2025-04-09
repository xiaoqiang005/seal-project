from rest_framework import permissions

class OrganizationPermission(permissions.BasePermission):
    """
    组织架构权限控制
    """
    def has_permission(self, request, view):
        # 开发阶段允许所有访问
        return True
        
    def has_object_permission(self, request, view, obj):
        # 开发阶段允许所有访问
        return True 