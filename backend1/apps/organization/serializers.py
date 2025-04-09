from rest_framework import serializers
from django.core.cache import cache
from .models import Organization

def generate_hierarchical_index(obj):
    """生成层级索引的公共方法
    
    Args:
        obj: Organization实例
        
    Returns:
        str: 层级索引字符串,如 "1.2.3"
        
    Note:
        使用缓存优化性能,缓存key格式为 org_index_{id}
        缓存时间设置为1小时
    """
    cache_key = f'org_index_{obj.id}'
    cached_index = cache.get(cache_key)
    if cached_index:
        return cached_index
        
    try:
        indices = []
        current = obj
        # 预先获取所有相关的父节点,减少数据库查询
        parent_ids = []
        while current:
            parent_ids.append(current.id)
            current = current.parent
            
        # 批量获取所有相关节点
        related_orgs = Organization.objects.filter(
            id__in=parent_ids
        ).select_related('parent')
        org_dict = {org.id: org for org in related_orgs}
        
        # 重新遍历生成索引
        current = obj
        while current:
            siblings = Organization.objects.filter(
                parent=current.parent
            ).order_by('sort_order', 'code')
            index = list(siblings).index(current) + 1
            indices.insert(0, str(index))
            current = org_dict.get(current.parent.id) if current.parent else None
            
        result = '.'.join(indices)
        # 缓存结果
        cache.set(cache_key, result, 3600)  # 缓存1小时
        return result
    except Exception as e:
        print(f"生成层级索引时出错: {str(e)}")
        return ''

class OrganizationListSerializer(serializers.ModelSerializer):
    """用于列表展示的区域序列化器
    
    这个序列化器用于简单的列表展示，不包含children字段，
    避免递归序列化可能导致的性能问题。
    """
    hierarchical_index = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = ['id', 'name', 'code', 'parent', 'level', 'created_at', 'updated_at', 'status', 'sort_order', 'hierarchical_index']
        
    def get_hierarchical_index(self, obj):
        return generate_hierarchical_index(obj)

class OrganizationSerializer(serializers.ModelSerializer):
    """区域序列化器
    
    这个序列化器用于完整的树形结构展示，包含children字段。
    children字段通过SerializerMethodField动态获取，
    并使用OrganizationListSerializer序列化子节点，避免无限递归。
    """
    children = serializers.SerializerMethodField()
    hierarchical_index = serializers.SerializerMethodField()
    code = serializers.CharField(required=False)  # 设置code字段为非必填
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 根据是否有父级设置code字段是否必填
        if self.context.get('request') and self.context['request'].data.get('parent'):
            self.fields['code'].required = False

    class Meta:
        model = Organization
        fields = ['id', 'name', 'code', 'parent', 'level', 'created_at', 
                 'updated_at', 'children', 'status', 'sort_order', 'hierarchical_index']
        extra_kwargs = {
            'code': {'required': True}  # 默认code是必填的
        }
        
    def validate(self, data):
        """验证数据
        
        验证规则：
        1. 有父级节点时,自动生成编码
        2. 根据父节点层级验证子节点层级的合法性
        3. 所有顶级节点(没有父节点的节点)需要验证编码格式和唯一性
        """
        # 获取当前操作的实例（如果是更新操作）
        instance = getattr(self, 'instance', None)
        
        # 如果是编辑操作且层级发生变化
        if instance and 'level' in data and data['level'] != instance.level:
            # 检查是否有子节点
            if instance.children.exists():
                raise serializers.ValidationError({'level': '该区域存在子节点，不能修改层级'})
            
            # 检查新层级是否符合父级层级规则
            parent = data.get('parent', instance.parent)
            if parent:
                new_level = data['level']
                if parent.level == '省级' and new_level not in ['市级', '区级', '县级']:
                    raise serializers.ValidationError({'level': '省级下只能是市级、区级或县级'})
                elif parent.level == '市级' and new_level not in ['区级', '县级']:
                    raise serializers.ValidationError({'level': '市级下只能是区级或县级'})
                elif parent.level == '区级' and new_level != '县级':
                    raise serializers.ValidationError({'level': '区级下只能是县级'})
                elif parent.level == '县级':
                    raise serializers.ValidationError({'level': '县级不能添加下级区域'})
        
        # 获取父节点和层级
        parent = data.get('parent')
        level = data.get('level')
        
        if not level:
            raise serializers.ValidationError({'level': '层级不能为空'})
            
        if parent:
            # 有父级节点时,自动生成编码
            data['code'] = parent.code
            
            # 验证父级层级与当前层级的关系
            if parent.level == '省级':
                if level not in ['市级', '区级', '县级']:
                    raise serializers.ValidationError({'level': '省级下只能添加市级、区级或县级'})
            elif parent.level == '市级':
                if level not in ['区级', '县级']:
                    raise serializers.ValidationError({'level': '市级下只能添加区级或县级'})
            elif parent.level == '区级':
                if level != '县级':
                    raise serializers.ValidationError({'level': '区级下只能添加县级'})
            else:  # 县级
                raise serializers.ValidationError({'level': '县级不能添加下级区域'})
                
            # 验证同级区域名称唯一性
            if Organization.objects.filter(
                parent=parent,
                name=data.get('name'),
            ).exclude(id=instance.id if instance else None).exists():
                raise serializers.ValidationError({'name': '同一父级下区域名称不能重复'})
        else:
            # 顶级节点验证
            # 验证编码格式和唯一性
            code = data.get('code')
            if not code:
                raise serializers.ValidationError({'code': '顶级区域必须提供编码'})
            
            if not code.isdigit() or len(code) != 6:
                raise serializers.ValidationError({'code': '编码必须是6位纯数字'})
            
            if Organization.objects.filter(code=code).exclude(
                id=instance.id if instance else None
            ).exists():
                raise serializers.ValidationError({'code': '该编码已存在'})
        
        return data

    def get_children(self, obj):
        """获取子节点
        
        使用select_related优化查询
        使用缓存减少重复查询
        """
        cache_key = f'org_children_{obj.id}'
        cached_children = cache.get(cache_key)
        if cached_children:
            return cached_children
            
        children = obj.children.all().select_related(
            'parent'
        ).prefetch_related(
            'children'
        ).order_by('sort_order', 'code', 'created_at')
        
        result = OrganizationListSerializer(children, many=True).data
        cache.set(cache_key, result, 3600)  # 缓存1小时
        return result

    def get_hierarchical_index(self, obj):
        return generate_hierarchical_index(obj) 